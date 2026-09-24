# Arquitetura

O plugin é um painel UXP para Adobe Premiere Pro.

## Fluxo principal

1. Obtém o projeto e a sequência ativos.
2. Percorre as trilhas de vídeo e áudio.
3. Recupera o `ProjectItem` associado a cada `TrackItem`.
4. Analisa nome, extensão, tipo de conteúdo, Adjustment Layer e cadeia de componentes.
5. Detecta MOGRT por `AE.ADBE Capsule` e FX adicionais pela cadeia de componentes.
6. Resolve conflitos por prioridade semântica.
7. Aplica o índice de cor ao `ProjectItem` dentro de uma transação undoable do Premiere.
8. Observa eventos de alteração de trilha e de aplicação de efeito para atualizar automaticamente.

## Limitação conhecida

O label é aplicado ao `ProjectItem` de origem. Se o mesmo arquivo-fonte aparecer em vários cortes, todos os cortes que exibem o label de origem podem refletir a mesma cor. Isso decorre do modelo exposto pela API UXP atual do Premiere.

## Compatibilidade

- Premiere Pro 25.6 ou superior
- UXP Manifest v5
- Instalador `.bat` voltado ao Windows
