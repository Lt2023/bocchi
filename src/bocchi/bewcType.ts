import {IStoreData} from "dooringx-lib/dist/core/store/storetype";

export interface IBewc {
    dxStore: IStoreData,
    blockCode: string,
    scriptCodes: Record<string, string>;
    widgetList: string[];
}
export interface IExecProp extends Record<string, any> {
    WIDGET_ID: string,
    METHOD: string
}