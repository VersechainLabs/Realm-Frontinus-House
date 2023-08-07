export const APIResponses = {
    OK : { Code: 20000, Detail: "Success"},
    DELEGATE : {
      NO_APPLICATION : { Code: 40031, Detail: "Can not find application"},
      NOT_VOTING : { Code: 40032, Detail: 'Not in the eligible voting period.'},
      DELEGATED : { Code: 40033, Detail: 'Already delegate to another address.'},
      OCCUPIED : { Code: 40034, Detail: 'Already created application. Can not delegate.'},
    }
};

export function APITransformer(dataObj: object, customDetail ?: string): object | PromiseLike<object> {
    let status = false;

    if (dataObj === APIResponses.OK) {
        status = true;
    }

    return {
        description: customDetail ?? dataObj["Detail"],
        status: status,
        code: dataObj["Code"],
    };
}