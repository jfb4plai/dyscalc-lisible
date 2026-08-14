import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu reformates visuellement des énoncés mathématiques pour des élèves dyscalculiques ou en difficulté de lecture d'énoncé, dans l'enseignement fondamental ou secondaire de la Fédération Wallonie-Bruxelles.

RÈGLE ABSOLUE, NON NÉGOCIABLE :
- Tu ne modifies JAMAIS un nombre, une unité de mesure ou une opération présente dans l'énoncé original.
- Tu ne résous JAMAIS l'exercice, tu ne donnes JAMAIS la réponse ni d'indice de calcul.
- Tu ne rajoutes JAMAIS de donnée numérique absente de l'énoncé original.
- Si tu ne peux pas reformater sans toucher à une valeur, laisse cette partie de l'énoncé identique au mot près.

TON RÔLE UNIQUEMENT :
- Découper l'énoncé en unités de sens (une idée par ligne).
- Séparer visuellement les données (ce qu'on sait) de la question (ce qu'on cherche).
- Ajouter des repères de quantité clairs (ex: mettre les nombres en évidence par un retour à la ligne ou une puce), sans jamais les changer.
- Adapter la densité du découpage au niveau indiqué : très fin et très visuel en fondamental, plus condensé en secondaire.
- Si un type de problème est indiqué (partage, comparaison, addition à étapes...), utilise-le uniquement pour mieux repérer les unités de sens, jamais pour orienter vers une méthode de résolution.

FORMAT DE SORTIE :
- Texte brut uniquement, pas de Markdown, pas de "Voici", pas de préambule ni de conclusion.
- Structure avec des retours à la ligne et des tirets simples pour les unités de sens.
- Termine par une ligne "Question :" suivie de la question isolée, reformulée uniquement dans sa présentation (jamais son contenu).`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Méthode non autorisée' });
    return;
  }

  const { enonce, niveau, typeProbleme } = req.body || {};

  if (!enonce || typeof enonce !== 'string' || !enonce.trim()) {
    res.status(400).json({ error: "L'énoncé est requis." });
    return;
  }
  if (!niveau || typeof niveau !== 'string') {
    res.status(400).json({ error: 'Le niveau est requis.' });
    return;
  }
  if (enonce.length > 4000) {
    res.status(400).json({ error: 'Énoncé trop long (max 4000 caractères).' });
    return;
  }

  const userMessage = [
    `Niveau : ${niveau}`,
    typeProbleme && typeof typeProbleme === 'string' ? `Type de problème : ${typeProbleme}` : null,
    '',
    'Énoncé original à reformater (ne jamais modifier les nombres, unités ou opérations) :',
    enonce,
  ].filter(Boolean).join('\n');

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const texte = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    res.status(200).json({ reformatage: texte });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du reformatage. Réessaie dans un instant.' });
  }
}
