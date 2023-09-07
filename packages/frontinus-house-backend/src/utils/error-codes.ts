export const APIResponses = {
    OK : { Code: 20000, Detail: "Success"},
    DELEGATE : {
      NO_APPLICATION : { Code: 40031, Detail: "Can not find application"},
      NOT_VOTING : { Code: 40032, Detail: 'Not in the eligible selection period.'},
      DELEGATED : { Code: 40033, Detail: 'Already delegate to another address.'},
      APPLICATION_EXIST : { Code: 40034, Detail: 'Already created application. Can not delegate.'},
      NO_POWER : { Code: 40035, Detail: 'Only Realms NFT holders have permission to delegate.'},
    }
};
export function APITransformer(infoObj: object, data: object, customDetail ?: string): object | PromiseLike<object> {
    let status = false;

    if (infoObj === APIResponses.OK) {
        status = true;
    }

    return {
        code: infoObj["Code"],
        status: status,
        description: customDetail ?? infoObj["Detail"],
        data: data,
    };
}