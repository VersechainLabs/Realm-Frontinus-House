export const nameToSlug = (name: string) => name.replaceAll(' ', '-').replaceAll('\/', '-').toLowerCase();

export const slugToName = (slug: string) => slug.replaceAll('-', ' ');

export const getSlug = (pathname:string) => {
    if (pathname.indexOf('/',1) === -1) {
        return pathname.substring(1);
    }
    return pathname.substring(1, pathname.indexOf('/',1));

};
