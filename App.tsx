import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import ProfileTestScreen from './src/screens/ProfileTestScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AdvisorScreen from './src/screens/AdvisorScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import CryptoDetailScreen from './src/screens/CryptoDetailScreen';
import MarketsScreen from './src/screens/MarketsScreen';
import ChatScreen from './src/screens/ChatScreen';
import PackDetailScreen from './src/screens/PackDetailScreen';
import VersusScreen from './src/screens/VersusScreen';
import AssetDetailScreen from './src/screens/AssetDetailScreen';
import StockDetailScreen from './src/screens/StockDetailScreen';
import CryptoInfoScreen from './src/screens/CryptoInfoScreen';
import NewsScreen from './src/screens/NewsScreen';
import MyMoneyScreen from './src/screens/MyMoneyScreen';
import BottomNav, { TabKey } from './src/components/BottomNav';
import FadeIn from './src/components/FadeIn';
import PanelProfile from './src/components/ProfilePanel';
import FaqSheet from './src/components/FaqSheet';
import TopBar from './src/components/TopBar';
import useSavedProfile from './src/hooks/useSavedProfile';
import { useAuth } from './src/hooks/AuthContext';
import { removeProfile } from './src/lib/storage';
import { registerNotifications } from './src/lib/notificaciones';
import { useTheme } from './src/theme/colors';
import type { CryptoState, CryptoInfo } from './src/domain/crypto';
import type { PackQuote, StockQuote } from './src/domain/markets';
import type { Asset } from './src/domain/asset';

/**
 * Cerebro de la app: decide qué pantalla se muestra en cada momento
 * (login → test del inversor → pestañas principales) y maneja la
 * navegación entre pestañas y pantallas de detalle.
 */
export default function App() {
  const [userProfile, setUserProfile] = useState<string>('Moderado');
  const [testCompleted, setTestCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [panelOpen, setPanelOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [cryptoDetail, setCryptoDetail] = useState<CryptoState | null>(null);
  const [packDetail, setPackDetail] = useState<PackQuote | null>(null);
  const [versusOpen, setVersusOpen] = useState(false);
  const [assetDetail, setAssetDetail] = useState<Asset | null>(null);
  const [stockDetail, setStockDetail] = useState<StockQuote | null>(null);
  const [cryptoInfo, setCryptoInfo] = useState<CryptoInfo | null>(null);
  const [newsOpen, setNewsOpen] = useState(false);
  const { token, email, investorProfile, loading: authLoading, logout } = useAuth();
  const { savedProfile, loading: profileLoading } = useSavedProfile();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const handleTestComplete = (perfilAsignado: string) => {
    setUserProfile(perfilAsignado);
    setTestCompleted(true); // A partir de acá, mostramos las pestañas
  };

  // Vuelve al onboarding para rehacer el test del inversor
  const redoTest = async () => {
    await removeProfile();
    setPanelOpen(false);
    setActiveTab('dashboard');
    setTestCompleted(false);
  };

  // Cierra sesión: borra token y perfil, vuelve al login
  const signOut = async () => {
    await logout();
    await removeProfile();
    setPanelOpen(false);
    setActiveTab('dashboard');
    setTestCompleted(false);
    setUserProfile('Moderado');
  };

  // Si hay un perfil guardado de una sesión anterior, saltamos el test
  useEffect(() => {
    if (savedProfile) {
      setUserProfile(savedProfile);
      setTestCompleted(true);
    }
  }, [savedProfile]);

  // Si el usuario logueado ya tiene perfil en el backend (vino en el login),
  // saltamos el test — así no hay que rehacerlo en cada login
  useEffect(() => {
    if (investorProfile) {
      setUserProfile(investorProfile);
      setTestCompleted(true);
    }
  }, [investorProfile]);

  // Registrar notificaciones push una vez logueado
  useEffect(() => {
    if (token) {
      registerNotifications();
    }
  }, [token]);

  const renderScreen = () => {
    switch (activeTab) {
      case 'mercados':
        return (
          <MarketsScreen
            onOpenPack={setPackDetail}
            onOpenCryptoDetail={setCryptoDetail}
            onOpenVersus={() => setVersusOpen(true)}
            onOpenStock={setStockDetail}
            onOpenCryptoInfo={setCryptoInfo}
          />
        );
      case 'midinero':
        return <MyMoneyScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'simulador':
        return <AdvisorScreen profile={userProfile} />;
      default:
        return (
          <DashboardScreen
            profile={userProfile}
            onGoToSimulator={() => setActiveTab('simulador')}
            onOpenCryptoDetail={setCryptoDetail}
            onOpenPack={setPackDetail}
            onOpenAssetDetail={setAssetDetail}
          />
        );
    }
  };

  // Detalle de cripto: pantalla completa encima del flujo con pestañas
  if (cryptoDetail) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <CryptoDetailScreen state={cryptoDetail} onBack={() => setCryptoDetail(null)} />
      </SafeAreaProvider>
    );
  }

  // Noticias financieras
  if (newsOpen) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <NewsScreen onBack={() => setNewsOpen(false)} />
      </SafeAreaProvider>
    );
  }

  // VERSUS: comparación cara a cara
  if (versusOpen) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <VersusScreen onBack={() => setVersusOpen(false)} />
      </SafeAreaProvider>
    );
  }

  // Detalle informativo de una cripto extra
  if (cryptoInfo) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <CryptoInfoScreen info={cryptoInfo} onBack={() => setCryptoInfo(null)} />
      </SafeAreaProvider>
    );
  }

  // Detalle de una acción (precio, gráfico y fundamentales)
  if (stockDetail) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <StockDetailScreen quote={stockDetail} onBack={() => setStockDetail(null)} />
      </SafeAreaProvider>
    );
  }

  // Detalle de un activo de renta fija (tendencia de 30 días)
  if (assetDetail) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AssetDetailScreen asset={assetDetail} onBack={() => setAssetDetail(null)} />
      </SafeAreaProvider>
    );
  }

  // Detalle de pack: composición y acceso al simulador
  if (packDetail) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <PackDetailScreen
          pack={packDetail}
          onBack={() => setPackDetail(null)}
        />
      </SafeAreaProvider>
    );
  }

  // Splash de arranque mientras leemos el storage (token + perfil)
  if (authLoading || profileLoading) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <View style={s.splash}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaProvider>
    );
  }

  // Sin token → flujo de autenticación (login/registro)
  if (!token) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        {authMode === 'login' ? (
          <LoginScreen onGoToRegister={() => setAuthMode('register')} />
        ) : (
          <RegisterScreen onGoToLogin={() => setAuthMode('login')} />
        )}
      </SafeAreaProvider>
    );
  }

  // El test es onboarding: pantalla única, sin pestañas.
  // Las pestañas aparecen recién cuando el usuario completa el test.
  if (!testCompleted) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <ProfileTestScreen onTestComplete={handleTestComplete} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <View style={s.container}>
        <TopBar
          onOpenPanel={() => setPanelOpen(true)}
          onOpenFaq={() => setFaqOpen(true)}
        />
        <FadeIn key={activeTab} style={s.content}>
          {renderScreen()}
        </FadeIn>
        <BottomNav activeTab={activeTab} onChange={setActiveTab} />
        <PanelProfile
          visible={panelOpen}
          profile={userProfile}
          email={email ?? ''}
          onClose={() => setPanelOpen(false)}
          onNavigate={setActiveTab}
          onOpenFaq={() => setFaqOpen(true)}
          onOpenVersus={() => setVersusOpen(true)}
          onOpenNews={() => setNewsOpen(true)}
          onRedoTest={redoTest}
          onLogout={signOut}
        />
        <FaqSheet visible={faqOpen} onClose={() => setFaqOpen(false)} />
      </View>
    </SafeAreaProvider>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.systemBackground },
    content: { flex: 1 },
    splash: { flex: 1, backgroundColor: colors.systemBackground, alignItems: 'center', justifyContent: 'center' },
  });
