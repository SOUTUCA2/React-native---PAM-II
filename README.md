# Rota Express — PAM II

## Integrantes

- Lucas Eduardo
- Lucas Honda
- Murilo Magalhães
- Vinicius Correia

Aplicativo didático de acompanhamento de entregas em React Native com Expo SDK 58. O trajeto é simulado localmente por coordenadas pré-definidas; não há backend nem rastreamento real de entregadores.

## Funcionalidades

- Mapa com entregador, destino e trajeto percorrido/a percorrer.
- Simulação que avança um ponto a cada 5 segundos.
- Cálculo de distância por Haversine e previsão aproximada a 22 km/h.
- Notificações locais quando o entregador fica a menos de 500 m e quando a entrega termina.
- Ícone direcional orientado pelo Magnetometer e indicador de bússola.
- Widget Android com status, distância e previsão estimada.
- Botão para reiniciar a simulação.

## Requisitos

- Node.js 22 LTS e npm.
- Android Studio e um emulador/dispositivo Android para testar o widget.
- Expo Go já inclui uma chave de teste do Google Maps. Para um development build próprio, configure uma chave de API do Google Maps com Maps SDK for Android habilitado e faturamento no Google Cloud.
- Um dispositivo físico é recomendado para testar o Magnetometer. O sensor pode não estar disponível em emuladores.

## Instalação e execução

No PowerShell, na pasta do projeto. Use os sufixos `.cmd` para evitar o bloqueio de scripts `.ps1` pela política de execução do PowerShell:

```powershell
npm.cmd install
$env:GOOGLE_MAPS_API_KEY = "SUA_CHAVE_DO_GOOGLE_MAPS"

# Este caminho do projeto contém acento; gere o Android por um atalho ASCII.
$project = (Get-Location).Path
$link = Join-Path $env:TEMP ("rota-express-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Junction -Path $link -Target $project | Out-Null
Push-Location $link
try {
  npx.cmd expo prebuild --platform android --no-install
  if ($LASTEXITCODE -ne 0) { throw "Falha ao gerar o projeto Android." }
} finally {
  Pop-Location
  Remove-Item -LiteralPath $link -Force
}

npx.cmd expo run:android
```

Para abrir no navegador:

```powershell
npx.cmd expo start --web
```

O mapa web e o mapa Android são representações esquemáticas locais do trajeto. No iOS, o mapa nativo usa Apple Maps.

O mapa Android não precisa de chave de API do Google Maps. Para executar no iOS, use macOS com Xcode:

```sh
npm install
npx expo prebuild --platform ios
npx expo run:ios
```

O projeto agora usa Expo SDK 58, compatível com o Expo Go SDK 58. Porém, o Expo Go não inclui o módulo nativo do widget Android. Para testar o aplicativo completo, incluindo o widget, instale Android Studio com JDK/SDK e use `npx.cmd expo run:android` para compilar um development build. Depois de instalar, adicione o widget **Status da entrega** pela tela de widgets do Android. `npx.cmd expo start` com Expo Go pode ser usado para uma prévia, mas não oferece o widget nativo.

## Gerar APK para entrega

O perfil `preview` em `eas.json` gera um APK Android instalável. Para gerar o arquivo na nuvem do Expo, instale/acesse uma conta Expo e, na raiz do projeto, execute:

```sh
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

O projeto já está vinculado ao EAS. O APK atual pode ser baixado por este link:

[Baixar APK Android](https://expo.dev/artifacts/eas/tpN68hsl3oOHDlHbRaMyh-CPcuus2JO0gx5U9tJ_lb8.apk)

Antes da entrega, instale o APK em um dispositivo Android ou emulador e confirme que o app abre. O APK gerado pelo EAS não é incluído como binário no repositório; o link acima permite baixar o arquivo sem adicionar um binário grande ao Git.
