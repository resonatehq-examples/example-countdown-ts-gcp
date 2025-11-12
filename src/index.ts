import { Resonate } from "@resonatehq/gcp";
import { countdown } from "./count";

const resonate = new Resonate();

resonate.register("countdown", countdown);

export const handler = resonate.handlerHttp();
