#!/bin/bash

# Script para testar o endpoint de preprocessamento
# Uso: bash test-preprocessing.sh

echo "================================================"
echo "  TESTE DE PREPROCESSAMENTO - SEM ENVIAR À IA"
echo "================================================"
echo ""

# URL da API
API_URL="http://localhost:3001/api/test-preprocessing"

# Dados de teste: CV vazio intentional + Job Description
echo "📤 Enviando requisição para $API_URL"
echo ""
echo "Teste 1: CV vazio (para detectar o erro)"
echo "---"

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "cv": "",
    "jobDescription": "About the job\nWhat is Teachable?\n\nTeachable is the platform for experts and businesses who take education seriously.\n\nWe are looking for a Software Engineer II with fullstack experience who is curious and action-oriented.",
    "language": "pt"
  }' | jq '.'

echo ""
echo "================================================"
echo ""
echo "Teste 2: CV com conteúdo + Job Description"
echo "---"

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "cv": "João Silva\nemail: joao@example.com\nTel: (11) 98765-4321\n\nOBJETIVO\nBusco posição em empresa dinâmica\n\nEXPERIÊNCIA\nDesenvolvedor Full Stack (2020-2024)\n- React, Node.js, TypeScript\n- PostgreSQL, MongoDB\n- Docker, AWS\n- Implementei solução que processava 1M requisições/dia\n\nSKILLS\nJavaScript, TypeScript, React, Node.js, Python, Docker, AWS, PostgreSQL, MongoDB",
    "jobDescription": "Senior Software Engineer\n\nRequisitos obrigatórios:\n- 5+ anos JavaScript/TypeScript\n- React ou Vue.js\n- Node.js\n- SQL database experience\n\nRequisitos desejáveis:\n- AWS\n- Docker/Kubernetes\n- Experience com GraphQL",
    "language": "pt"
  }' | jq '.'

echo ""
echo "================================================"
echo "✨ Testes concluídos! Verifique os resultados acima."
echo ""
echo "📊 Métricas importantes:"
echo "   - reduction: % de redução no tamanho do prompt"
echo "   - estimatedTokens: tokens estimados que serão usados"
echo ""
