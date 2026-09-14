import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CalendarCheck, MessageCircle, Check, Smartphone, Loader2, ShieldCheck, CreditCard, Landmark, Clock, XCircle, UserPlus, LogIn, CalendarClock, Eye, EyeOff, Mail, AlertTriangle } from 'lucide-react';
import { SPECIALTIES, waLink, WHATSAPP_NUMBER } from '@/data/site';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext';
import { usePublicProviders } from '@/lib/usePublicProviders';
const BookingPage = () => {
  const [params] = useSearchParams();
  const preset = params.get('prestataire') || '';
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    provider: preset,
    specialty: '',
    date: '',
    time: '',
    notes: ''
  });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState({ status: 'idle', error: '' });
  const [bookingId, setBookingId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [transactionId, setTransactionId] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [emailStatus, setEmailStatus] = useState('pending');
  const [slotError, setSlotError] = useState('');
  const { isAuthed, user, signup } = useAuth();
  const { providers } = usePublicProviders();
  const [account, setAccount] = useState({ status: 'idle', error: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const set = k => e => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    // Clear any previous "slot taken" notice as soon as the visitor changes
    // the prestataire, the date or the time.
    if (k === 'provider' || k === 'date' || k === 'time') setSlotError('');
  };
  const chosen = providers.find(p => p.slug === form.provider);

  // Services actually offered by the chosen provider. When no provider is
  // selected, fall back to the full list of specialties so the visitor can
  // still pick a generic prestation.
  const providerServices = chosen && Array.isArray(chosen.services) ? chosen.services : [];
  const availableServices = chosen ? providerServices.map(s => s.name) : SPECIALTIES;
  const singleService = chosen && providerServices.length === 1 ? providerServices[0].name : null;
  useEffect(() => {
    if (chosen) {
      // Auto-select when the provider offers exactly one service; otherwise
      // reset the field so the visitor picks from the provider's menu.
      setForm(f => {
        if (singleService) {
          return f.specialty === singleService ? f : {
            ...f,
            specialty: singleService
          };
        }
        return f.specialty && availableServices.includes(f.specialty) ? f : {
          ...f,
          specialty: ''
        };
      });
    }
  }, [form.provider]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedServiceObj = chosen?.services?.find(s => s.name === (form.specialty || singleService));
  const amountFcfa = selectedServiceObj ? parseInt(String(selectedServiceObj.price).replace(/\D/g, ''), 10) : null;

  const handleFedapayPayment = async () => {
    if (!amountFcfa) return;
    setPayment({ status: 'loading', error: '' });
    try {
      const [firstname, ...rest] = form.name.trim().split(' ');
      const lastname = rest.join(' ') || firstname || 'Client';
      const res = await apiServerClient.fetch('/fedapay/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountFcfa,
          description: `Réservation GlowNyo - ${form.specialty || singleService || 'Prestation'}`,
          customer: { firstname: firstname || 'Client', lastname, email: form.email, phone: form.phone },
          bookingId
        })
      });
      if (!res.ok) throw new Error('payment_failed');
      const data = await res.json();
      if (data.paymentUrl) {
        setTransactionId(data.transactionId);
        setPaymentStatus('pending');
        window.open(data.paymentUrl, '_blank', 'noopener,noreferrer');
        setPayment({ status: 'idle', error: '' });
      } else {
        throw new Error('payment_failed');
      }
    } catch (err) {
      console.error('fedapay payment failed', err);
      setPayment({ status: 'error', error: "Le paiement en ligne est momentanément indisponible. Vous pouvez régler directement avec votre prestataire ou réessayer dans un instant." });
    }
  };

  const handleVerifyPayment = async () => {
    if (!transactionId) return;
    setVerifying(true);
    try {
      const res = await apiServerClient.fetch('/fedapay/verify-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, bookingId })
      });
      if (!res.ok) throw new Error('verify_failed');
      const data = await res.json();
      setPaymentStatus(data.paymentStatus || 'pending');
    } catch (err) {
      console.error('fedapay verification failed', err);
      setPayment(p => ({ ...p, error: "Impossible de vérifier le statut du paiement pour le moment. Réessayez dans un instant." }));
    } finally {
      setVerifying(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!form.email) {
      setAccount(a => ({ ...a, error: 'Renseignez une adresse email dans le formulaire pour créer un compte.' }));
      return;
    }
    if (account.password.length < 8) {
      setAccount(a => ({ ...a, error: 'Le mot de passe doit contenir au moins 8 caractères.' }));
      return;
    }
    setAccount(a => ({ ...a, status: 'loading', error: '' }));
    try {
      await signup(form.email, account.password, { name: form.name });
      setAccount(a => ({ ...a, status: 'done', error: '' }));
    } catch (err) {
      const msg = err?.response?.email?.message || err?.response?.message || "Impossible de créer le compte. Cet email est peut-être déjà utilisé.";
      setAccount(a => ({ ...a, status: 'idle', error: msg }));
    }
  };

  // Asks the Express server whether a concrete provider+date+time slot is
  // still free. Returns true when the slot is already booked. Fails OPEN
  // (returns false) on any error — the DB unique index is the final guard.
  const isSlotTaken = async (providerName, date, time) => {
    try {
      const res = await apiServerClient.fetch('/bookings/check-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerName, date, time })
      });
      if (!res.ok) return false;
      const data = await res.json();
      return data.available === false;
    } catch {
      return false;
    }
  };

  // Polls the booking status a few times so the confirmation screen can
  // report whether the confirmation email was actually sent. Stops as soon
  // as a terminal state (sent/failed) is received.
  const pollEmailStatus = (id) => {
    const delays = [900, 1800, 3500, 6000];
    let cancelled = false;
    (async () => {
      for (const delay of delays) {
        await new Promise(r => setTimeout(r, delay));
        if (cancelled) return;
        try {
          const res = await apiServerClient.fetch(`/bookings/${id}/status`, { method: 'GET' });
          if (!res.ok) continue;
          const data = await res.json();
          setEmailStatus(data.email_status || 'pending');
          if (data.email_status === 'sent' || data.email_status === 'failed') return;
        } catch {
          /* keep polling */
        }
      }
    })();
    return () => { cancelled = true; };
  };

  const buildMessage = () => {
    const providerLabel = chosen ? chosen.name : 'une prestataire GlowNyo';
    return `Bonjour GlowNyo ! Je souhaite réserver un rendez-vous.
• Nom : ${form.name}
• Téléphone : ${form.phone}
• Prestataire : ${providerLabel}
• Prestation : ${form.specialty || singleService || (chosen ? chosen.specialty : '—')}
• Date souhaitée : ${form.date} ${form.time}
• Notes : ${form.notes || '—'}`;
  };
  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setSlotError('');
    setSubmitting(true);

    // Concrete provider + date + time define a "créneau" that must be locked.
    // Re-check availability right before creating the record so a slot taken
    // while the visitor was filling the form is caught with a clear message.
    const providerName = chosen ? chosen.name : '';
    const hasSlot = providerName && form.date && form.time;
    if (hasSlot) {
      const taken = await isSlotTaken(providerName, form.date, form.time);
      if (taken) {
        setSlotError("Ce créneau vient d'être réservé par une autre personne. Veuillez choisir une autre date ou heure.");
        setSubmitting(false);
        return;
      }
    }

    try {
      const record = await pb.collection('bookings').create({
        name: form.name,
        phone: form.phone,
        email: form.email,
        service: form.specialty || singleService || (chosen ? chosen.specialty : ''),
        provider: chosen ? chosen.name : form.provider || '',
        provider_email: chosen && chosen.email ? chosen.email : '',
        date: form.date,
        time: form.time,
        message: form.notes,
        payment_status: 'pending',
        email_status: 'pending',
        // Link the booking to the signed-in client's account when she has one.
        // Guest booking (no account) stays the default — owner is simply unset.
        ...(isAuthed && user?.id ? { owner: user.id } : {})
      });
      setBookingId(record.id);
      setPaymentStatus('pending');
      setEmailStatus('pending');
      setSent(true);
      // Best-effort: report whether the confirmation email was delivered.
      pollEmailStatus(record.id);
    } catch (err) {
      console.error('booking creation failed', err);
      // The DB unique index is the authoritative race guard: if two visitors
      // submitted the same slot at the same time, the second create is rejected
      // here. Re-check to give a precise, actionable message.
      if (hasSlot) {
        const taken = await isSlotTaken(providerName, form.date, form.time).catch(() => false);
        if (taken) {
          setSlotError("Ce créneau vient d'être réservé par une autre personne. Veuillez choisir une autre date ou heure.");
          setSubmitting(false);
          return;
        }
      }
      setError("Une erreur est survenue lors de l'envoi. Veuillez réessayer ou nous contacter directement sur WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };
  return <div className="pt-32 pb-24 mx-auto max-w-[72rem] px-5 sm:px-8">
      <div className="max-w-2xl">
        <span className="text-xs tracking-widest uppercase text-gold">Réservation</span>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl font-semibold leading-tight">
          Prenez rendez-vous
        </h1>
        <p className="mt-5 text-[#F5F0E6]/70 text-lg">
          Renseignez vos préférences ci-dessous. Votre demande est enregistrée automatiquement et transmise
          à votre prestataire. Réglez en toute sécurité par Mobile Money grâce à FedaPay.
        </p>
      </div>

      <div className="mt-12 grid lg:grid-cols-[1fr_320px] gap-8">
        {/* FORM */}
        <div className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6 sm:p-8">
          {sent ? <div className="text-center py-10">
              <div className="mx-auto w-16 h-16 rounded-full gold-gradient flex items-center justify-center">
                <Check size={30} className="text-[#0A0A0A]" strokeWidth={3} />
              </div>
              <h2 className="mt-6 font-display text-2xl font-semibold">Demande enregistrée</h2>
              <p className="mt-3 text-[#F5F0E6]/65 max-w-md mx-auto">
                Votre demande a bien été enregistrée et transmise à votre prestataire ainsi qu'à l'équipe
                GlowNyo. Votre prestataire vous contactera rapidement pour confirmer votre créneau. Vous
                pouvez aussi confirmer les détails via WhatsApp.
              </p>

              <div className="mt-5 mx-auto max-w-md">
                <EmailStatusBanner status={emailStatus} />
              </div>

              <div className="mt-5 flex justify-center">
                <PaymentStatusBadge status={paymentStatus} />
              </div>

              <div className="mt-8 mx-auto max-w-md rounded-2xl border border-[#C9922A]/25 bg-gradient-to-b from-[#C9922A]/[0.06] to-transparent p-6 text-left">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-gold shrink-0" />
                  <h3 className="font-display text-lg font-semibold">Réglez votre acompte en toute sécurité</h3>
                </div>
                <p className="mt-2 text-sm text-[#F5F0E6]/60">
                  Le paiement est traité par FedaPay, notre partenaire de paiement sécurisé agréé pour
                  l'Afrique de l'Ouest.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9922A]/20 bg-[#0A0A0A] px-3 py-1.5 text-xs text-[#F5F0E6]/80">
                    <Smartphone size={13} className="text-gold" /> MTN Mobile Money
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9922A]/20 bg-[#0A0A0A] px-3 py-1.5 text-xs text-[#F5F0E6]/80">
                    <Smartphone size={13} className="text-gold" /> Moov Money
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9922A]/20 bg-[#0A0A0A] px-3 py-1.5 text-xs text-[#F5F0E6]/80">
                    <CreditCard size={13} className="text-gold" /> Carte bancaire
                  </span>
                </div>

                {amountFcfa ? <>
                    <div className="mt-5 flex items-center justify-between border-t border-[#C9922A]/15 pt-4">
                      <span className="text-sm text-[#F5F0E6]/60">Montant à régler</span>
                      <span className="font-display text-xl font-semibold text-gold">{amountFcfa.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    {paymentStatus !== 'paid' && <button onClick={handleFedapayPayment} disabled={payment.status === 'loading'} className="mt-4 w-full gold-gradient text-[#0A0A0A] font-semibold px-6 py-3.5 rounded-full flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-60">
                      {payment.status === 'loading' ? <>
                          <Loader2 size={18} className="animate-spin" /> Ouverture du paiement sécurisé...
                        </> : <>
                          <Landmark size={18} /> Payer avec FedaPay
                        </>}
                    </button>}
                    {transactionId && paymentStatus !== 'paid' && <button onClick={handleVerifyPayment} disabled={verifying} className="mt-3 w-full border border-[#C9922A]/40 text-[#F5F0E6] px-6 py-3 rounded-full flex items-center justify-center gap-2 hover:bg-[#C9922A]/10 transition disabled:opacity-60">
                      {verifying ? <>
                          <Loader2 size={16} className="animate-spin" /> Vérification en cours...
                        </> : <>
                          <ShieldCheck size={16} /> J'ai payé, vérifier le statut
                        </>}
                    </button>}
                    {payment.error && <p className="mt-3 text-sm text-red-400">{payment.error}</p>}
                    {paymentStatus === 'paid' && <p className="mt-3 text-sm text-emerald-400">Votre acompte a bien été confirmé par FedaPay. Merci !</p>}
                    {paymentStatus === 'failed' && <p className="mt-3 text-sm text-red-400">Le paiement a échoué ou a été annulé. Vous pouvez réessayer ci-dessus.</p>}
                  </> : <p className="mt-5 text-sm text-[#F5F0E6]/50 border-t border-[#C9922A]/15 pt-4">
                    Un lien de paiement sécurisé FedaPay vous sera communiqué par notre équipe pour finaliser
                    le règlement de votre prestation.
                  </p>}

                <p className="mt-4 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#F5F0E6]/35">
                  <ShieldCheck size={12} /> Paiement chiffré et sécurisé par FedaPay
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <a href={waLink(buildMessage())} target="_blank" rel="noreferrer" className="bg-[#25D366] text-white font-semibold px-6 py-3.5 rounded-full flex items-center justify-center gap-2 hover:brightness-105 transition">
                  <MessageCircle size={18} /> Confirmer sur WhatsApp
                </a>
                {WHATSAPP_NUMBER && <a href={waLink('Bonjour GlowNyo, je souhaite contacter le service client au sujet de ma réservation.')} target="_blank" rel="noreferrer" className="border border-[#25D366]/50 text-[#25D366] px-6 py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-[#25D366]/10 transition"><MessageCircle size={18} /> Contacter l'équipe de GlowNyo</a>}
              </div>

              {/* Optional account creation — lets the client view & manage her
                  appointments later. Booking itself never requires an account. */}
              <div className="mt-10 mx-auto max-w-md rounded-2xl border border-[#C9922A]/20 bg-[#0A0A0A]/60 p-6 text-left">
                {isAuthed || account.status === 'done' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <CalendarClock size={18} className="text-gold shrink-0" />
                      <h3 className="font-display text-lg font-semibold">Votre espace client est prêt</h3>
                    </div>
                    <p className="mt-2 text-sm text-[#F5F0E6]/60">
                      Retrouvez et gérez tous vos rendez-vous GlowNyo depuis votre espace personnel.
                    </p>
                    <Link to="/mes-rendez-vous" className="mt-4 inline-flex items-center gap-2 gold-gradient text-[#0A0A0A] font-semibold px-5 py-2.5 rounded-full hover:brightness-110 transition">
                      <CalendarClock size={16} /> Voir mes rendez-vous
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <UserPlus size={18} className="text-gold shrink-0" />
                      <h3 className="font-display text-lg font-semibold">Créer un compte (facultatif)</h3>
                    </div>
                    <p className="mt-2 text-sm text-[#F5F0E6]/60">
                      Pour consulter et gérer vos rendez-vous à tout moment. La réservation reste
                      possible <strong className="text-[#F5F0E6]/80">sans compte</strong>.
                    </p>
                    <div className="mt-4 flex flex-col gap-3">
                      <input
                        type="email"
                        value={form.email}
                        readOnly
                        placeholder="Votre email"
                        className="w-full rounded-xl bg-[#0A0A0A] border border-[#C9922A]/20 px-4 py-3 text-[#F5F0E6]/70 cursor-not-allowed"
                      />
                      <div className="relative">
                        <input
                          type={showPwd ? 'text' : 'password'}
                          value={account.password}
                          onChange={e => setAccount(a => ({ ...a, password: e.target.value, error: '' }))}
                          placeholder="Choisissez un mot de passe (8 caractères min.)"
                          autoComplete="new-password"
                          className="w-full rounded-xl bg-[#0A0A0A] border border-[#C9922A]/20 px-4 py-3 pr-12 text-[#F5F0E6] placeholder:text-[#F5F0E6]/30 focus:outline-none focus:border-[#C9922A] transition [color-scheme:dark]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd(s => !s)}
                          aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F5F0E6]/50 hover:text-gold transition p-1"
                        >
                          {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {account.error && <p className="text-sm text-red-400">{account.error}</p>}
                      <button
                        onClick={handleCreateAccount}
                        disabled={account.status === 'loading'}
                        className="w-full border border-[#C9922A]/40 text-[#F5F0E6] px-6 py-3 rounded-full flex items-center justify-center gap-2 hover:bg-[#C9922A]/10 transition disabled:opacity-60"
                      >
                        {account.status === 'loading' ? (
                          <><Loader2 size={16} className="animate-spin" /> Création en cours...</>
                        ) : (
                          <><UserPlus size={16} /> Créer mon compte</>
                        )}
                      </button>
                      <Link to="/connexion" className="text-center text-sm text-[#F5F0E6]/55 hover:text-gold transition inline-flex items-center justify-center gap-1.5">
                        <LogIn size={14} /> J'ai déjà un compte
                      </Link>
                    </div>
                  </>
                )}
              </div>

              <button onClick={() => { setSent(false); setBookingId(null); setTransactionId(null); setPaymentStatus('pending'); setEmailStatus('pending'); setSlotError(''); setAccount({ status: 'idle', error: '', password: '' }); }} className="mt-6 text-sm text-[#F5F0E6]/50 hover:text-gold transition">
                Modifier ma demande
              </button>
            </div> : <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-5">
              <Field label="Nom complet" className="sm:col-span-2">
                <input required value={form.name} onChange={set('name')} placeholder="Votre nom" className={inputCls} />
              </Field>
              <Field label="Téléphone / WhatsApp">
                <input required value={form.phone} onChange={set('phone')} placeholder="+229 ..." className={inputCls} />
              </Field>
              <Field label="Email">
                <input type="email" value={form.email} onChange={set('email')} placeholder="vous@exemple.com" className={inputCls} />
              </Field>
              <Field label="Prestataire">
                <select value={form.provider} onChange={set('provider')} className={inputCls}>
                  <option value="">Peu importe / à conseiller</option>
                  {providers.filter(p => p && p.name && p.name.trim()).map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
                </select>
              </Field>
              <Field label="Prestation souhaitée">
                <select value={form.specialty} onChange={set('specialty')} className={inputCls} disabled={!!singleService}>
                  <option value="">{chosen ? 'Choisir une prestation' : 'Choisir une spécialité'}</option>
                  {availableServices.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Date souhaitée">
                <input required type="date" value={form.date} onChange={set('date')} className={inputCls} />
              </Field>
              <Field label="Heure préférée" className="sm:col-span-1">
                <input required type="time" value={form.time} onChange={set('time')} className={inputCls} />
              </Field>
              <Field label="Notes (optionnel)" className="sm:col-span-2">
                <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Précisez vos attentes, longueur, style..." className={inputCls} />
              </Field>
              {slotError && <div className="sm:col-span-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 flex items-start gap-2">
                <XCircle size={18} className="shrink-0 mt-0.5" />
                <span>{slotError}</span>
              </div>}
              {error && <p className="sm:col-span-2 text-sm text-red-400">{error}</p>}
              <button type="submit" disabled={submitting} className="sm:col-span-2 gold-gradient text-[#0A0A0A] font-semibold px-6 py-4 rounded-full flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-60">
                {submitting ? <>
                    <Loader2 size={18} className="animate-spin" /> Envoi en cours...
                  </> : <>
                    <CalendarCheck size={18} /> Envoyer ma demande
                  </>}
              </button>
            </form>}
        </div>

        {/* SIDE */}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <ShieldCheck size={18} className="text-gold" /> Paiement sécurisé FedaPay
            </h3>
            <p className="mt-3 text-sm text-[#F5F0E6]/65 leading-relaxed">
              Réglez vos prestations en toute sécurité une fois votre demande envoyée.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <span className="inline-flex items-center gap-2 text-sm text-[#F5F0E6]/75">
                <Smartphone size={14} className="text-gold" /> MTN Mobile Money
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-[#F5F0E6]/75">
                <Smartphone size={14} className="text-gold" /> Moov Money
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-[#F5F0E6]/75">
                <CreditCard size={14} className="text-gold" /> Carte bancaire (Visa, Mastercard)
              </span>
            </div>
          </div>
          <div className="rounded-3xl border border-[#C9922A]/15 bg-[#0F0F0F] p-6">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <CalendarCheck size={18} className="text-gold" /> Confirmation directe
            </h3>
            <p className="mt-3 text-sm text-[#F5F0E6]/65 leading-relaxed">
              Votre demande est envoyée directement à votre prestataire, qui vous recontacte pour confirmer
              votre créneau. Aucun agenda externe, tout se passe ici.
            </p>
          </div>
          {chosen && <div className="rounded-3xl border border-[#C9922A]/30 bg-[#C9922A]/5 p-6">
              <p className="text-xs uppercase tracking-widest text-gold">Prestataire sélectionnée</p>
              <div className="mt-3 flex items-center gap-3">
                <img src={chosen.image} alt={chosen.name} className="w-14 h-14 rounded-full object-cover border border-[#C9922A]/40" />
                <div>
                  <p className="font-display font-semibold">{chosen.name}</p>
                  <p className="text-sm text-[#F5F0E6]/60">{chosen.specialty}</p>
                </div>
              </div>
            </div>}
        </aside>
      </div>
    </div>;
};
const inputCls = 'w-full rounded-xl bg-[#0A0A0A] border border-[#C9922A]/20 px-4 py-3 text-[#F5F0E6] placeholder:text-[#F5F0E6]/30 focus:outline-none focus:border-[#C9922A] transition [color-scheme:dark]';

const PAYMENT_STATUS_META = {
  pending: { label: 'En attente', icon: Clock, className: 'bg-[#C9922A]/10 text-gold border-[#C9922A]/30' },
  paid: { label: 'Acompte payé', icon: Check, className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  failed: { label: 'Paiement échoué', icon: XCircle, className: 'bg-red-500/10 text-red-400 border-red-500/30' }
};

export const PaymentStatusBadge = ({ status }) => {
  const meta = PAYMENT_STATUS_META[status] || PAYMENT_STATUS_META.pending;
  const Icon = meta.icon;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide ${meta.className}`}>
    <Icon size={13} /> {meta.label}
  </span>;
};

const EMAIL_STATUS_META = {
  sent: { icon: Mail, className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300', text: "Un email de confirmation vous a été envoyé — ainsi qu'à votre prestataire — avec tous les détails de votre rendez-vous." },
  failed: { icon: AlertTriangle, className: 'border-red-500/30 bg-red-500/10 text-red-300', text: "Votre réservation est bien enregistrée. L'email de confirmation n'a pas pu être envoyé pour l'instant : vérifiez votre adresse email ou contactez-nous sur WhatsApp pour confirmer." },
  pending: { icon: Clock, className: 'border-[#C9922A]/30 bg-[#C9922A]/10 text-gold', text: "Envoi de votre email de confirmation en cours… Pensez à vérifier vos spams." },
};

export const EmailStatusBanner = ({ status }) => {
  const meta = EMAIL_STATUS_META[status] || EMAIL_STATUS_META.pending;
  const Icon = meta.icon;
  return <div className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-left text-sm ${meta.className}`}>
    <Icon size={18} className="shrink-0 mt-0.5" />
    <span>{meta.text}</span>
  </div>;
};
const Field = ({
  label,
  children,
  className = ''
}) => <label className={`flex flex-col gap-2 ${className}`}>
    <span className="text-sm text-[#F5F0E6]/70">{label}</span>
    {children}
  </label>;
export default BookingPage;