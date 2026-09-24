# GD Timeline Colors Pro

Plugin UXP para Adobe Premiere Pro que organiza a timeline automaticamente por cores, usando uma linguagem visual fixa para vídeo, B-roll, imagens, gráficos, motion, áudio, música, efeitos, Adjustment Layers, SFX, branding e sequências.

Versão estável atual: 3.1.0.

## Recursos

- organização automática da timeline;
- detecção de FX pela cadeia de componentes do clipe;
- detecção de MOGRT / Motion Graphics;
- identificação de Adjustment Layers;
- classificação por tipo de mídia, nome e função editorial;
- modo automático com observação de alterações na sequência;
- botão de reanálise de FX;
- modo alternativo de cores por trilha;
- preset definitivo com 16 categorias;
- instalação simples no Windows;
- alterações integradas ao Undo/Redo do Premiere.

## Compatibilidade

- Adobe Premiere Pro 25.6 ou superior;
- UXP Manifest v5;
- Windows para o instalador `.bat`.

## Instalação

1. Baixe ou clone este repositório.
2. Feche o Premiere Pro.
3. Execute `installer/INSTALAR.bat` (ele gera o `.ccx` localmente e instala).
4. Abra o Premiere.
5. Acesse `Janela > Plugins UXP > GD Timeline Colors Pro`.
6. Na Timeline, mantenha `Show Source Clip Name and Label` ativado.
7. Clique em `ORGANIZAR TIMELINE`.

## Paleta definitiva

| Categoria | Cor |
| --- | --- |
| Vídeo principal | `#2563EB` |
| B-roll | `#14B8A6` |
| Foto / imagem | `#EAB308` |
| Texto / Graphic | `#8B5CF6` |
| Motion / MOGRT | `#EC4899` |
| Áudio / voz | `#22C55E` |
| Música | `#6366F1` |
| FX visual | `#F97316` |
| Ajuste / cor | `#06B6D4` |
| SFX | `#EF4444` |
| Logo / branding | `#84CC16` |
| Nest / sequência | `#4F46E5` |
| Revisar | `#F43F5E` |
| Aprovado | `#16A34A` |
| Offline / problema | `#991B1B` |
| Organização / Bin | `#64748B` |

A ordem técnica dos slots está documentada em `docs/PALETA.md`.

## Estrutura

```text
plugin/      código-fonte do painel UXP
preset/      preset definitivo de labels
installer/   instalador e desinstalador Windows
build/       pacote CCX gerado localmente pelo instalador
docs/        documentação técnica
```

## Como funciona

O plugin percorre os itens de vídeo e áudio da sequência ativa, identifica o tipo editorial de cada item e aplica um label ao `ProjectItem` correspondente. Para efeitos, analisa a cadeia de componentes do `TrackItem`. O modo automático observa alterações na sequência e reaplica a classificação quando necessário.

## Limitação da API do Premiere

O UXP atual aplica a cor ao `ProjectItem` de origem. Se o mesmo arquivo-fonte for usado em vários cortes e apenas um deles tiver FX, a cor do item de origem pode aparecer nos demais cortes que usam o mesmo `ProjectItem`.

## Projeto

Grupo Delta Tecnologia — GD Timeline Colors Pro.
