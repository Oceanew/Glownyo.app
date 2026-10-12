import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, CalendarDays, LoaderCircle, Newspaper } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { formatNewsDate } from '@/pages/NewsPage';

const fileUrl = (id, filename) => `${pb.baseUrl}/api/files/actualites/${id}/${filename}`;

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    // No need to filter statut here — the collection's own viewRule already
    // hides drafts from anyone but an admin, so a 404 here means either the
    // id doesn't exist or (for a regular visitor) it's not published yet.
    pb.collection('actualites')
      .getOne(id)
      .then((rec) => {
        if (active) setItem(rec);
      })
      .catch((err) => {
        console.error('failed to load news item', err);
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="pt-40 pb-32 flex items-center justify-center gap-3 text-[#F5F0E6]/60">
        <LoaderCircle className="animate-spin" size={20} />
        <span>Chargement…</span>
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="pt-40 pb-32 text-center px-5">
        <Newspaper size={28} className="mx-auto text-gold/40" />
        <h1 className="mt-4 font-display text-3xl">Actualité introuvable</h1>
        <Link to="/actualites" className="mt-6 inline-block text-gold">
          Retour aux actualités
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24">
      <Helmet>
        <title>{`${item.titre} — GlowNyo`}</title>
        <meta name="description" content={item.texte.slice(0, 160)} />
      </Helmet>

      <article className="mx-auto max-w-[56rem] px-5 sm:px-8">
        <button
          onClick={() => navigate('/actualites')}
          className="flex items-center gap-2 text-sm text-[#F5F0E6]/60 hover:text-gold transition mb-8"
        >
          <ArrowLeft size={16} /> Retour aux actualités
        </button>

        <p className="flex items-center gap-1.5 text-xs text-[#F5F0E6]/45">
          <CalendarDays size={13} /> {formatNewsDate(item.date_publication)}
        </p>
        <h1 className="mt-3 font-display text-3xl sm:text-5xl font-semibold leading-tight">
          {item.titre}
        </h1>

        {item.image && (
          <div className="mt-8 rounded-3xl overflow-hidden border border-[#C9922A]/20">
            <img src={fileUrl(item.id, item.image)} alt={item.titre} className="w-full object-cover" />
          </div>
        )}

        <p className="mt-8 text-[#F5F0E6]/80 text-lg leading-relaxed whitespace-pre-wrap">
          {item.texte}
        </p>
      </article>
    </div>
  );
};

export default NewsDetailPage;
