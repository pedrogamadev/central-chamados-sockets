import { mainMenu } from "./mainMenu";

mainMenu().catch((error) => {
  console.error("Erro ao executar o menu:", error);
  process.exit(1);
});
