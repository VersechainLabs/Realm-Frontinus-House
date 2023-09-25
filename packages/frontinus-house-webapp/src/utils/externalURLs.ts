export enum ExternalURL {
  discord,
  twitter,
  github,
  usermannual,
}

export const externalURL = (externalURL: ExternalURL) => {
  switch (externalURL) {
    case ExternalURL.discord:
      return 'https://discord.gg/uQnjZhZPfu';
    case ExternalURL.twitter:
      return 'https://twitter.com/LootRealms';
    case ExternalURL.github:
      return 'https://github.com/BibliothecaDAO';
      case ExternalURL.usermannual:
      return 'https://docs.metaforo.io/frontinushouse-user-manual';
  }
};
