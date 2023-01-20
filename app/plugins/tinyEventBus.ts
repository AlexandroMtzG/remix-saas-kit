import { TinyEmitter } from "tiny-emitter";
const emitter = new TinyEmitter();
export default function tinyEventBus() {
  return { emitter };
}
