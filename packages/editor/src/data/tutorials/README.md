# Tutoriais

Esta pasta contém os arquivos JSON dos tutoriais que serão exibidos no playground.

## Como adicionar um novo tutorial:

1. No editor, crie seu flow de tutorial
2. Clique no botão de download (⬇️) no canto superior direito (apenas para admins/moderadores)
3. Preencha o nome e descrição do tutorial
4. Salve o arquivo baixado nesta pasta
5. O tutorial estará automaticamente disponível no playground

## Como usar no playground:

### Opção 1: Por ID do tutorial
```
http://localhost:5178/editor/playground?tutorialId=soma-numeros
```

### Opção 2: Por nome do arquivo (sem extensão)
```
http://localhost:5178/editor/playground?tutorial=tutorial-68f4f926441db5455726e618
```

## Estrutura do arquivo JSON:

```json
{
  "id": "soma-numeros",
  "title": "Somar Dois Números",
  "description": "Exemplo simples de como somar dois valores",
  "flow": {
    "nodes": [...],
    "edges": [...],
    "nodeData": {...},
    "detectedTypes": {...},
    "variables": {...}
  },
  "exportedAt": "2025-10-30T23:00:00.000Z"
}
```

## Exemplo de tutoriais:

- `soma-numeros.json` - Tutorial básico de soma
- `filtrar-lista.json` - Filtragem de arrays
- `calcular-media.json` - Operações matemáticas complexas
