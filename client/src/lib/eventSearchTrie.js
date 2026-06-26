const normalize = (value) => String(value || '').trim().toLowerCase();

const getSearchValues = (event) => [
  event.title,
  event.category,
  event.location,
  event.organizer,
  event.createdBy?.name,
  event.description,
];

const getSuggestionValues = (event) => [
  event.title,
  event.category,
  event.location,
  event.organizer,
  event.createdBy?.name,
];

const tokenize = (values) =>
  values
    .filter(Boolean)
    .flatMap((value) => normalize(value).split(/[^a-z0-9]+/))
    .filter(Boolean);

const getEventId = (event, index) => event._id || event.id || String(index);

const createNode = () => ({
  children: new Map(),
  eventIds: new Set(),
  suggestions: new Map(),
});

const addSuggestion = (node, value) => {
  const label = String(value || '').trim();

  if (!label) {
    return;
  }

  const key = normalize(label);

  if (!node.suggestions.has(key)) {
    node.suggestions.set(key, label);
  }
};

const insertToken = (root, token, eventId, suggestions) => {
  let node = root;

  node.eventIds.add(eventId);

  for (const character of token) {
    if (!node.children.has(character)) {
      node.children.set(character, createNode());
    }

    node = node.children.get(character);
    node.eventIds.add(eventId);

    suggestions.forEach((suggestion) => addSuggestion(node, suggestion));
  }
};

const findNode = (root, prefix) => {
  let node = root;

  for (const character of prefix) {
    node = node.children.get(character);

    if (!node) {
      return null;
    }
  }

  return node;
};

const intersectSets = (sets) => {
  if (sets.length === 0) {
    return new Set();
  }

  return sets
    .slice(1)
    .reduce(
      (result, currentSet) => new Set([...result].filter((eventId) => currentSet.has(eventId))),
      new Set(sets[0]),
    );
};

export const buildEventSearchIndex = (events) => {
  const root = createNode();
  const eventById = new Map();
  const orderedIds = [];

  events.forEach((event, index) => {
    const eventId = getEventId(event, index);
    const tokens = new Set(tokenize(getSearchValues(event)));
    const suggestions = getSuggestionValues(event).filter(Boolean);

    eventById.set(eventId, event);
    orderedIds.push(eventId);

    tokens.forEach((token) => insertToken(root, token, eventId, suggestions));
  });

  const search = (query) => {
    const terms = tokenize([query]);

    if (terms.length === 0) {
      return events;
    }

    const matchedSets = terms.map((term) => findNode(root, term)?.eventIds || new Set());
    const matchedIds = intersectSets(matchedSets);

    return orderedIds.filter((eventId) => matchedIds.has(eventId)).map((eventId) => eventById.get(eventId));
  };

  const suggest = (query, limit = 5) => {
    const terms = tokenize([query]);
    const activeTerm = terms.at(-1);

    if (!activeTerm) {
      return [];
    }

    const node = findNode(root, activeTerm);

    if (!node) {
      return [];
    }

    return [...node.suggestions.values()].slice(0, limit);
  };

  return { search, suggest };
};
