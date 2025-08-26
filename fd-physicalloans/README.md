# Physical Loans dApp - Frontend Modernizado

Este es el frontend actualizado de la aplicación Physical Loans dApp, migrado de librerías obsoletas (Moralis, web3uikit) a librerías modernas y mantenidas activamente.

## 🚀 Tecnologías Actualizadas

### Antes (Obsoletas)

- ❌ **Moralis** - SDK de Web3 descontinuado
- ❌ **react-moralis** - Hooks de React para Moralis
- ❌ **web3uikit** - Componentes UI descontinuados

### Ahora (Modernas)

- ✅ **wagmi** - Hooks de React para Ethereum
- ✅ **viem** - Cliente TypeScript para Ethereum
- ✅ **@rainbow-me/rainbowkit** - Kit de componentes para conexión de wallets
- ✅ **lucide-react** - Iconos modernos
- ✅ **shadcn/ui** - Componentes UI modernos y accesibles
- ✅ **sonner** - Notificaciones toast modernas

## 📦 Instalación

1. **Instalar dependencias:**

```bash
npm install
```

2. **Configurar variables de entorno:**
   Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUBGRAPH_URL=tu_url_del_subgraph
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=tu_project_id_de_walletconnect
```

3. **Ejecutar en desarrollo:**

```bash
npm run dev
```

## 🔧 Configuración de WalletConnect

Para usar WalletConnect, necesitas obtener un Project ID:

1. Ve a [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Crea una cuenta y un nuevo proyecto
3. Copia el Project ID
4. Agrégalo a tu `.env.local`

## 🎨 Características del Frontend Actualizado

### ✅ Conexión de Wallet

- **Multi-wallet support**: MetaMask, WalletConnect, Injected wallets
- **Auto-reconexión**: Mantiene la sesión activa
- **Cambio de cuenta**: Detecta automáticamente cambios de cuenta
- **UI moderna**: Interfaz limpia y profesional

### ✅ Componentes UI Modernos

- **Cards responsivas**: Diseño adaptativo para móviles
- **Formularios accesibles**: Cumple estándares de accesibilidad
- **Iconos consistentes**: Usando Lucide React
- **Notificaciones toast**: Feedback visual inmediato

### ✅ Experiencia de Usuario Mejorada

- **Loading states**: Indicadores de carga claros
- **Error handling**: Manejo de errores elegante
- **Responsive design**: Funciona en todos los dispositivos
- **Dark/Light mode ready**: Preparado para temas

## 🏗️ Estructura del Proyecto

```
app/
├── components/
│   ├── ui/           # Componentes base (Button, Card, Input, etc.)
│   ├── Header.jsx    # Header con conexión de wallet
│   ├── NFTBox.jsx    # Tarjeta de NFT con acciones
│   └── ...
├── create-tool/      # Página para crear herramientas
├── globals.css       # Estilos globales
├── layout.jsx        # Layout principal
├── page.jsx          # Página principal
└── providers.jsx     # Providers de wagmi, rainbowkit, etc.
```

## 🔄 Migración de Código

### Antes (Moralis)

```javascript
import { useMoralis, useWeb3Contract } from "react-moralis";

const { isWeb3Enabled, account, chainId } = useMoralis();
const { runContractFunction } = useWeb3Contract({
  abi: contractABI,
  contractAddress: address,
  functionName: "functionName",
});
```

### Ahora (wagmi)

```javascript
import { useAccount, useWriteContract, useReadContract } from "wagmi";

const { address, isConnected } = useAccount();
const { writeContract } = useWriteContract();
const { data } = useReadContract({
  address: contractAddress,
  abi: contractABI,
  functionName: "functionName",
});
```

## 🎯 Funcionalidades Principales

1. **Conexión de Wallet**

   - Botón de conexión/desconexión
   - Detección de cambio de cuenta
   - Soporte para múltiples wallets

2. **Visualización de NFTs**

   - Cards modernas con información completa
   - Estados visuales (Available, Rented, etc.)
   - Acciones contextuales según el rol

3. **Creación de Herramientas**

   - Formulario moderno y validado
   - Upload de imágenes
   - Integración con smart contracts

4. **Gestión de Fondos**
   - Visualización de balance
   - Retiro de ganancias
   - Notificaciones de transacciones

## 🚀 Deploy

### Vercel (Recomendado)

```bash
npm run build
vercel --prod
```

### Netlify

```bash
npm run build
# Subir la carpeta .next a Netlify
```

## 🔧 Troubleshooting

### Error de WalletConnect

- Verifica que el `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` esté configurado
- Asegúrate de que el dominio esté en la lista blanca de WalletConnect

### Error de Subgraph

- Verifica que `NEXT_PUBLIC_SUBGRAPH_URL` apunte a un endpoint válido
- Revisa que el subgraph esté sincronizado

### Problemas de Build

- Limpia la caché: `rm -rf .next && npm run build`
- Verifica que todas las dependencias estén instaladas

## 📝 Notas de Desarrollo

- El proyecto usa **Next.js 15** con App Router
- **TypeScript** está configurado pero no es obligatorio
- **Tailwind CSS** para estilos
- **Apollo Client** para consultas GraphQL

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
