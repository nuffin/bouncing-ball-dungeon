
export enum MessageType {
    FAILED = -1,
    SUCCESS = 0,
    LOW_POWER = 1,
};

export const MessageContent: Partial<{ [key in MessageType]: string }> = {
    [MessageType.FAILED]: "非常可惜……失败了……\n再来一把！",
    [MessageType.SUCCESS]: "恭喜过关~",
    [MessageType.LOW_POWER]: "体力快要耗尽啦……",
};