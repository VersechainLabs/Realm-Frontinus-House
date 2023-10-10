export const nameToSlug = (name: string) => name.replaceAll(' ', '-').replaceAll('\/', '-').toLowerCase();

export const slugToName = (slug: string) => slug.replaceAll('-', ' ');

export const getSlug = (pathname:string) => {

    return pathname.substring(1, pathname.indexOf('/',1));

};
