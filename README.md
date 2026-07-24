# App de Anotações e Controle de Produtos

Um aplicativo móvel desenvolvido em React Native (Expo) para gerenciamento de notas, controle de estoque pessoal, cálculos rápidos e captura de imagens. Os dados são salvos diretamente no dispositivo do usuário.

---

## Como Iniciar o Projeto

### Pré-requisitos
* Node.js com NPM (ou o gerenciador de pacotes da sua preferência) instalado.
* Aplicativo **Expo Go** instalado no seu celular (Android ou iOS).
SKD 54 54.0.36.

### Passo a Passo

1. **Clone o repositório:**
```bash
   git clone https://github.com/ryancunhha/app-notas.git
```

2. **Entre na pasta do projeto e instale as dependências**
```bash
   npm i
```

3. **Inicie o projeto**
```bash
   npm start
```

Caso encontre problemas de conexão, tente usar o modo tunnel:
```bash
   npx expo start --tunnel
```

4. **Abra o app no celular: Escaneie o QR Code que vai aparecer no seu terminal usando o aplicativo Expo Go.**

---

## Funcionalidades

* **Cadastro de Produtos:** Salve o nome e o número do produto.
* **Calculadora Integrada:** Faça contas rápidas sem precisar sair do aplicativo.
* **Armazenamento Local:** Seus dados ficam salvos em segurança diretamente no seu celular.
* **Sistema de Busca:** Encontre suas notas rapidamente digitando o termo de pesquisa.
* **Filtros Inteligentes:** Organize e filtre suas notas por tipo.
* **Compartilhamento:** Compartilhe suas anotações com facilidade com outras pessoas.

---

## Tecnologias Utilizadas

* **React Native**
* **JavaScript**
* **Expo (Framework & CLI)**
* **Async Storage** (para persistência de dados localmente)
* **Expo Camera** (para captura de fotos no app)

---

## Status do Projeto (O que já tem / O que falta)

Aqui está o progresso do desenvolvimento do aplicativo:

### ✅ Concluído (Já feito)
- [x] Criar a estrutura inicial do projeto em React Native.
- [x] Desenvolver a tela principal do aplicativo.
- [x] Implementar a funcionalidade de salvar o nome do produto.
- [x] Implementar a funcionalidade de salvar o número do produto.
- [x] Criar a calculadora integrada.
- [x] Configurar o salvamento dos dados no armazenamento local do celular.
- [x] Sistema de pesquisa por notas.
- [x] Filtragem de notas por tipo.
- [x] Compartilhamento de notas.
- [x] Refinar o design e a identidade visual da interface do aplicativo.

### ⏳ Próximos Passos (O que falta fazer)
- [ ] Implementar câmera
- [ ] Implementar detecção de texto na câmera para preencher o nome e número do produto automaticamente ao tirar a foto.
- [ ] Adicionar acessibilidade para o usuário ampliar o tamanho da fonte nas notas.
- [ ] Adicionar notificações de lembrete.

---