export enum ExternalURL {
  discord,
  twitter,
  github,
}

export const externalURL = (externalURL: ExternalURL) => {
  switch (externalURL) {
    case ExternalURL.discord:
      return 'https://discord.gg/uQnjZhZPfu';
    case ExternalURL.twitter:
      return 'https://twitter.com/LootRealms';
    case ExternalURL.github:
      return 'https://github.com/BibliothecaDAO';
  }
};
