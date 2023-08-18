export const matchImg = (imgAry: string[], inputString : string) => {
    for (let i = 0; i < imgAry.length; i++) {
        console.log(imgAry[i]);
        if( imgAry[i] !== '' && matchString(inputString, imgAry[i]) ) {
            console.log('return img',imgAry[i]);
            return imgAry[i];
        }
    }

    return '';

};


function matchString(str:string, pattern:string) {
    const regex = new RegExp(pattern);
    return regex.test(str);
}