import "./adapter"
import { mainMinigame, start } from "./dist/main";

mainMinigame()
    .then(start);