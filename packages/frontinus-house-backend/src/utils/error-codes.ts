export const APIResponses = {
    OK : { Code: 20000, Detail: "Success"},
    DELEGATE : {
      NO_APPLICATION : { Code: 40031, Detail: "Can not find application"},
      NOT_VOTING : { Code: 40032, Detail: 'Not in the eligible voting period.'},
      DELEGATED : { Code: 40033, Detail: 'Already delegate to another address.'},
      OCCUPIED : { Code: 40034, Detail: 'Already created application. Can not delegate.'},
      NO_POWER : { Code: 40035, Detail: 'Only Realms NFT holders have permission to approve.'},
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

// export const VoteStates = {
//     OK : { code: 200, canVote: true, reason: "Can vote."},
//     VOTED : { code: 311, canVote: false, reason: "You have voted for this proposal."}, // For Frontend: Can cancel
//     NOT_VOTING : { code: 312, canVote: false, reason: "Not in the eligible voting period."},
//     DUPLICATE : { code: 313, canVote: false, reason: "Vote for prop failed because user has already been voted in this round."},
//     NO_POWER : { code: 314, canVote: false, reason: "Only Realms NFT holders have permission to approve."},

//     // For Appliation only:
//     NO_APPLICATION : { code: 315, canVote: false, reason: "Can not find application."},
//     APPLICATION_EXIST : { code: 317, canVote: false, reason: "Already created application. Can not delegate to this address."},
// };
