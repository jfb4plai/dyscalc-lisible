import { useState, useRef } from 'react';

const NIVEAUX = [
  { value: '', label: 'Choisir un niveau' },
  { value: 'fondamental-P1-P2', label: 'Fondamental P1-P2' },
  { value: 'fondamental-P3-P4', label: 'Fondamental P3-P4' },
  { value: 'fondamental-P5-P6', label: 'Fondamental P5-P6' },
  { value: 'secondaire-S1-S2', label: 'Secondaire S1-S2' },
  { value: 'secondaire-S3-S4', label: 'Secondaire S3-S4' },
  { value: 'secondaire-S5-S6', label: 'Secondaire S5-S6' },
];

function nouvelExercice() {
  return { id: crypto.randomUUID(), enonce: '', typeProbleme: '', resultat: '', loading: false, erreur: '' };
}

export default function App() {
  const [niveau, setNiveau] = useState('');
  const [eleve, setEleve] = useState('');
  const [exercices, setExercices] = useState([nouvelExercice()]);
  const compteur = useRef(1);

  const peutEnvoyer =
    niveau !== '' &&
    exercices.some((ex) => ex.enonce.trim().length > 0) &&
    !exercices.some((ex) => ex.loading);

  function majExercice(id, champs) {
    setExercices((prev) => prev.map((ex) => (ex.id === id ? { ...ex, ...champs } : ex)));
  }

  function ajouterExercice() {
    compteur.current += 1;
    setExercices((prev) => [...prev, nouvelExercice()]);
  }

  function supprimerExercice(id) {
    setExercices((prev) => (prev.length > 1 ? prev.filter((ex) => ex.id !== id) : prev));
  }

  async function reformaterUn(ex) {
    if (!ex.enonce.trim()) return;
    majExercice(ex.id, { loading: true, erreur: '', resultat: '' });
    try {
      const res = await fetch('/api/reformater', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enonce: ex.enonce, niveau, typeProbleme: ex.typeProbleme }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      majExercice(ex.id, { loading: false, resultat: data.reformatage });
    } catch (e) {
      majExercice(ex.id, { loading: false, erreur: e.message || 'Une erreur est survenue. Réessayez.' });
    }
  }

  function reformaterTous() {
    exercices.filter((ex) => ex.enonce.trim().length > 0).forEach((ex) => reformaterUn(ex));
  }

  const auMoinsUnResultat = exercices.some((ex) => ex.resultat);

  return (
    <div>
      <nav className="plai-nav">
        <a href="/" className="plai-nav-logo">
          <img src="/plai-logo.jpg" alt="PLAI" style={{ height: 32, width: 'auto', borderRadius: 6 }} />
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
          <h2>Reformater un ou plusieurs énoncés mathématiques</h2>
          <p style={{ color: 'var(--text2)', marginBottom: '1.25rem' }}>
            Colle un ou plusieurs énoncés, l'outil les redécoupe visuellement (unités de sens, données, question)
            pour réduire la charge de lecture — sans jamais toucher aux nombres ni à la difficulté posée.
            Chaque exercice est numéroté et traité individuellement.
          </p>

          <div className="gardefou no-print">
            <span aria-hidden="true">⚠️</span>
            <span>
              <strong>Garde-fou non négociable</strong> — cet outil ne modifie jamais un nombre, une unité
              ou une opération de l'énoncé original. Il ne résout rien : il reformate uniquement la présentation.
              L'énoncé original reste toujours visible à côté du résultat, exercice par exercice.
            </span>
          </div>

          <div className="plai-card">
            <div className="plai-field">
              <label className="plai-label" htmlFor="niveau">Niveau *</label>
              <select id="niveau" className="plai-input" value={niveau} onChange={(e) => setNiveau(e.target.value)}>
                {NIVEAUX.map((n) => (
                  <option key={n.value} value={n.value}>{n.label}</option>
                ))}
              </select>
              <p className="plai-help">
                Calibre la finesse du découpage pour l'ensemble des exercices : plus fin et plus visuel en fondamental, plus condensé en secondaire.
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
          </div>

          {exercices.map((ex, index) => (
            <div className="plai-card" key={ex.id} style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16 }}>Exercice {index + 1}</h3>
                {exercices.length > 1 && (
                  <button
                    type="button"
                    className="plai-btn-ghost no-print"
                    onClick={() => supprimerExercice(ex.id)}
                    aria-label={`Supprimer l'exercice ${index + 1}`}
                  >
                    Supprimer
                  </button>
                )}
              </div>

              <div className="plai-field">
                <label className="plai-label" htmlFor={`enonce-${ex.id}`}>Énoncé original *</label>
                <textarea
                  id={`enonce-${ex.id}`}
                  className="plai-input"
                  rows={4}
                  placeholder="Ex : Marie a 24 billes. Elle en donne 7 à son frère et achète encore 3 sachets de 5 billes. Combien de billes a-t-elle maintenant ?"
                  value={ex.enonce}
                  onChange={(e) => majExercice(ex.id, { enonce: e.target.value })}
                />
                <p className="plai-help">
                  Colle le texte exact de cet exercice, tel qu'il apparaît dans le support de cours. Aucune donnée numérique ne sera modifiée.
                </p>
              </div>

              <div className="plai-field">
                <label className="plai-label" htmlFor={`type-${ex.id}`}>Type de problème (optionnel)</label>
                <input
                  id={`type-${ex.id}`}
                  className="plai-input"
                  placeholder="Ex : partage, comparaison, addition à étapes..."
                  value={ex.typeProbleme}
                  onChange={(e) => majExercice(ex.id, { typeProbleme: e.target.value })}
                />
                <p className="plai-help">
                  Aide l'IA à mieux repérer les unités de sens de cet exercice (données vs question). Laissé vide, le découpage reste générique mais fonctionnel.
                </p>
              </div>

              {ex.erreur && <div className="plai-error">{ex.erreur}</div>}
            </div>
          ))}

          <div className="chip-row no-print">
            <button type="button" className="plai-btn-ghost" onClick={ajouterExercice}>
              + Ajouter un exercice
            </button>
            <button type="button" className="plai-btn" onClick={reformaterTous} disabled={!peutEnvoyer}>
              {exercices.some((ex) => ex.loading)
                ? 'Reformatage en cours…'
                : exercices.length > 1
                ? `Reformater les ${exercices.length} exercices`
                : "Reformater l'énoncé"}
            </button>
          </div>
        </section>

        {auMoinsUnResultat && (
          <section className="plai-section">
            <h2>Résultats — à relire et ajuster</h2>
            <p style={{ color: 'var(--text2)', marginBottom: '1rem' }}>
              Chaque proposition est une base de travail, pas un texte final. Relis-la, ajuste-la avec ton contexte de classe avant impression.
            </p>

            {exercices.map((ex, index) =>
              ex.resultat ? (
                <div key={ex.id} style={{ marginBottom: '1.75rem' }}>
                  <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, marginBottom: '0.5rem' }}>
                    Exercice {index + 1}
                  </h3>
                  <div className="reformat-grid">
                    <div className="reformat-col">
                      <h3>Énoncé original</h3>
                      <div className="reformat-original">{ex.enonce}</div>
                    </div>
                    <div className="reformat-col">
                      <h3>Proposition de reformatage (modifiable)</h3>
                      <textarea
                        className="reformat-editable"
                        value={ex.resultat}
                        onChange={(e) => majExercice(ex.id, { resultat: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="chip-row no-print">
                    <button type="button" className="plai-btn-ghost" onClick={() => reformaterUn(ex)} disabled={ex.loading}>
                      Régénérer cet exercice
                    </button>
                  </div>
                </div>
              ) : null
            )}

            <div className="chip-row no-print">
              <button className="plai-btn" onClick={() => window.print()}>Imprimer / exporter en PDF</button>
            </div>
          </section>
        )}

        <section className="plai-section">
          <h2 style={{ fontSize: 16 }}>Ce que cet outil ne fait pas</h2>
          <p style={{ color: 'var(--text2)' }}>
            Il ne résout pas les exercices, ne simplifie aucune valeur numérique et ne remplace pas un accompagnement
            spécifique de la dyscalculie. Il réduit la charge de lecture/repérage de chaque énoncé — le raisonnement
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
