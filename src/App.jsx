import { useState } from 'react';

const NIVEAUX = [
  { value: '', label: 'Choisir un niveau' },
  { value: 'fondamental-P1-P2', label: 'Fondamental P1-P2' },
  { value: 'fondamental-P3-P4', label: 'Fondamental P3-P4' },
  { value: 'fondamental-P5-P6', label: 'Fondamental P5-P6' },
  { value: 'secondaire-S1-S2', label: 'Secondaire S1-S2' },
  { value: 'secondaire-S3-S4', label: 'Secondaire S3-S4' },
  { value: 'secondaire-S5-S6', label: 'Secondaire S5-S6' },
];

export default function App() {
  const [enonce, setEnonce] = useState('');
  const [niveau, setNiveau] = useState('');
  const [typeProbleme, setTypeProbleme] = useState('');
  const [eleve, setEleve] = useState('');
  const [resultat, setResultat] = useState('');
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState('');

  const peutEnvoyer = enonce.trim().length > 0 && niveau !== '' && !loading;

  async function reformater() {
    setErreur('');
    setResultat('');
    setLoading(true);
    try {
      const res = await fetch('/api/reformater', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enonce, niveau, typeProbleme }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      setResultat(data.reformatage);
    } catch (e) {
      setErreur(e.message || 'Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <nav className="plai-nav">
        <a href="/" className="plai-nav-logo">
          <img src="/plai-logo.jpg" alt="PLAI" style={{ width: 32, height: 32, borderRadius: 6 }} />
          DyscalcLisible
        </a>
        <div className="plai-nav-actions">
          <a className="plai-nav-link" href="https://portail-plai.vercel.app" target="_blank" rel="noreferrer">
            Portail PLAI
          </a>
        </div>
      </nav>

      <div className="plai-container">
        <section className="plai-section">
          <span className="plai-badge">Accessibilité — dyscalculie</span>
          <h2>Reformater un énoncé mathématique</h2>
          <p style={{ color: 'var(--text2)', marginBottom: '1.25rem' }}>
            Colle un énoncé, l'outil le redécoupe visuellement (unités de sens, données, question)
            pour réduire la charge de lecture — sans jamais toucher aux nombres ni à la difficulté posée.
          </p>

          <div className="gardefou no-print">
            <span aria-hidden="true">⚠️</span>
            <span>
              <strong>Garde-fou non négociable</strong> — cet outil ne modifie jamais un nombre, une unité
              ou une opération de l'énoncé original. Il ne résout rien : il reformate uniquement la présentation.
              L'énoncé original reste toujours visible à côté du résultat.
            </span>
          </div>

          <div className="plai-card">
            <div className="plai-field">
              <label className="plai-label" htmlFor="enonce">Énoncé original *</label>
              <textarea
                id="enonce"
                className="plai-input"
                rows={5}
                placeholder="Ex : Marie a 24 billes. Elle en donne 7 à son frère et achète encore 3 sachets de 5 billes. Combien de billes a-t-elle maintenant ?"
                value={enonce}
                onChange={(e) => setEnonce(e.target.value)}
              />
              <p className="plai-help">
                Colle le texte exact de l'énoncé, tel qu'il apparaît dans le support de cours. Aucune donnée numérique ne sera modifiée.
              </p>
            </div>

            <div className="plai-field">
              <label className="plai-label" htmlFor="niveau">Niveau *</label>
              <select id="niveau" className="plai-input" value={niveau} onChange={(e) => setNiveau(e.target.value)}>
                {NIVEAUX.map((n) => (
                  <option key={n.value} value={n.value}>{n.label}</option>
                ))}
              </select>
              <p className="plai-help">
                Calibre la finesse du découpage : plus fin et plus visuel en fondamental, plus condensé en secondaire.
              </p>
            </div>

            <div className="plai-field">
              <label className="plai-label" htmlFor="type">Type de problème (optionnel)</label>
              <input
                id="type"
                className="plai-input"
                placeholder="Ex : partage, comparaison, addition à étapes..."
                value={typeProbleme}
                onChange={(e) => setTypeProbleme(e.target.value)}
              />
              <p className="plai-help">
                Aide l'IA à mieux repérer les unités de sens (données vs question). Laissé vide, le découpage reste générique mais fonctionnel.
              </p>
            </div>

            <div className="plai-field">
              <label className="plai-label" htmlFor="eleve">Élève concerné (optionnel)</label>
              <input
                id="eleve"
                className="plai-input"
                placeholder="Ex : code élève D07 (jamais de nom)"
                value={eleve}
                onChange={(e) => setEleve(e.target.value)}
              />
              <p className="plai-help">
                Reste uniquement dans ce navigateur, jamais envoyé ni stocké en base — utile pour retrouver la fiche imprimée. N'inscris jamais de nom réel.
              </p>
            </div>

            {erreur && <div className="plai-error">{erreur}</div>}

            <button className="plai-btn" onClick={reformater} disabled={!peutEnvoyer}>
              {loading ? 'Reformatage en cours…' : 'Reformater l\'énoncé'}
            </button>
          </div>
        </section>

        {resultat && (
          <section className="plai-section">
            <h2>Résultat — à relire et ajuster</h2>
            <p style={{ color: 'var(--text2)', marginBottom: '1rem' }}>
              Cette proposition est une base de travail, pas un texte final. Relis-la, ajuste-la avec ton contexte de classe avant impression.
            </p>
            <div className="reformat-grid">
              <div className="reformat-col">
                <h3>Énoncé original</h3>
                <div className="reformat-original">{enonce}</div>
              </div>
              <div className="reformat-col">
                <h3>Proposition de reformatage (modifiable)</h3>
                <textarea
                  className="reformat-editable"
                  value={resultat}
                  onChange={(e) => setResultat(e.target.value)}
                />
              </div>
            </div>
            <div className="chip-row no-print">
              <button className="plai-btn" onClick={() => window.print()}>Imprimer / exporter en PDF</button>
              <button className="plai-btn-ghost" onClick={reformater} disabled={loading}>Régénérer</button>
            </div>
          </section>
        )}

        <section className="plai-section">
          <h2 style={{ fontSize: 16 }}>Ce que cet outil ne fait pas</h2>
          <p style={{ color: 'var(--text2)' }}>
            Il ne résout pas l'exercice, ne simplifie aucune valeur numérique et ne remplace pas un accompagnement
            spécifique de la dyscalculie. Il réduit la charge de lecture/repérage de l'énoncé — le raisonnement
            mathématique reste entièrement à la charge de l'élève.
          </p>
        </section>
      </div>

      <footer className="plai-footer">
        <p>Ancrage scientifique (corpus RISS) : Le Cam &amp; Toussaint (2017) — la première difficulté réside dans la compréhension de l'énoncé ; Boiteault &amp; Percheminier (2022) — la relecture/schématisation de l'énoncé réduit la surcharge cognitive.</p>
        <p>PLAI — Pôle Liégeois d'Accompagnement vers une École Inclusive</p>
      </footer>
    </div>
  );
}
