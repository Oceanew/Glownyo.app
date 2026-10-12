import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { LoaderCircle, Newspaper, ArrowRight, CalendarDays } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const fileUrl = (id, filename) => `${pb.baseUrl}/api/files/actualites/${id}/${filename}`;

export const formatNewsDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

// Shared fetch for the list of published news, most recent first — used by
// both this page and the homepage preview section.
export const fetchPublishedNews = (limit) =>
  pb.collection('actualites').getList(1, limit || 200, {
    filter: 'statut = "publie"',
    sort: '-date_publication',
  });

const NewsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchPublishedNews()
      .then((res) => {
        if (active) setItems(res.items);
      })
      .catch((err) => {
        console.error('failed to load news', err);
        if (active) setError('Impossible de charger les actualités pour le moment.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="pt-28 pb-24">
      <Helmet>
        <title>Actualités — GlowNyo</title>
        <meta
          name="description"
          content="Les dernières actualités GlowNyo : nouveautés, lancements et annonces de la plateforme."
        />
      </Helmet>

      <section className="mx-auto max-w-[72rem] px-5 sm:px-8">
        <span className="text-xs tracking-widest uppercase text-gold">Actualités</span>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl font-semibold leading-tight max-w-3xl">
          Les nouvelles de GlowNyo
        </h1>
        <p className="mt-5 text-[#F5F0E6]/70 text-lg max-w-2xl leading-relaxed">
          Lancements, nouveautés et annonces de l'équipe GlowNyo.
        </p>
      </section>

      <section className="mx-auto max-w-[72rem] px-5 sm:px-8 mt-16">
        {loading && (
          <div className="flex items-center justify-center gap-3 text-[#F5F0E6]/60 py-16">
            <LoaderCircle className="animate-spin" size={20} />
            <span>Chargement des actualités…</span>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16 text-[#F5F0E6]/60">{error}</div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-16 text-[#F5F0E6]/60">
            Aucune actualité pour le moment. Revenez bientôt !
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid gap-6">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/actualites/${item.id}`}
                className="group rounded-2xl border border-[#C9922A]/15 bg-[#0F0F0F] overflow-hidden hover:border-[#C9922A]/45 transition flex flex-col sm:flex-row"
              >
                {item.image ? (
                  <div className="sm:w-64 shrink-0 aspect-[16/9] sm:aspect-auto overflow-hidden">
                    <img
                      src={fileUrl(item.id, item.image)}
                      alt={item.titre}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                ) : (
                  <div className="sm:w-64 shrink-0 aspect-[16/9] sm:aspect-auto flex items-center justify-center bg-[#0A0A0A]">
                    <Newspaper size={28} className="text-gold/40" />
                  </div>
                )}
                <div className="p-6 sm:p-7 flex flex-col">
                  <p className="flex items-center gap-1.5 text-xs text-[#F5F0E6]/45">
                    <CalendarDays size={13} /> {formatNewsDate(item.date_publication)}
                  </p>
                  <h2 className="mt-2 font-display text-xl sm:text-2xl font-semibold leading-snug">
                    {item.titre}
                  </h2>
                  <p className="mt-2.5 text-sm text-[#F5F0E6]/65 leading-relaxed line-clamp-3">
                    {item.texte}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-gold group-hover:gap-2.5 transition-all">
                    Lire la suite <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default NewsPage;
