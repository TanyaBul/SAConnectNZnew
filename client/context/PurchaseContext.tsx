import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform, Alert } from "react-native";
import Purchases, { 
  PurchasesPackage, 
  CustomerInfo,
  LOG_LEVEL,
  PurchasesError,
} from "react-native-purchases";

const REVENUECAT_API_KEY_IOS = "your_ios_api_key";
const REVENUECAT_API_KEY_ANDROID = "your_android_api_key";

interface PurchaseContextType {
  isSubscribed: boolean;
  isLoading: boolean;
  packages: PurchasesPackage[];
  customerInfo: CustomerInfo | null;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  checkSubscription: () => Promise<void>;
}

const PurchaseContext = createContext<PurchaseContextType | null>(null);

export function PurchaseProvider({ children }: { children: ReactNode }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    initializePurchases();
  }, []);

  const initializePurchases = async () => {
    try {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      const apiKey = Platform.OS === "ios" 
        ? REVENUECAT_API_KEY_IOS 
        : REVENUECAT_API_KEY_ANDROID;

      await Purchases.configure({ apiKey });
      setIsConfigured(true);

      await loadCustomerInfo();
      await loadOfferings();
    } catch (error) {
      console.log("RevenueCat initialization (expected in Expo Go):", error);
      setIsLoading(false);
    }
  };

  const loadCustomerInfo = async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      
      const hasActiveSubscription = 
        Object.keys(info.entitlements.active).length > 0 ||
        info.activeSubscriptions.length > 0;
      
      setIsSubscribed(hasActiveSubscription);
    } catch (error) {
      console.log("Error loading customer info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current?.availablePackages) {
        setPackages(offerings.current.availablePackages);
      }
    } catch (error) {
      console.log("Error loading offerings:", error);
    }
  };

  const purchasePackage = async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { customerInfo: newInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(newInfo);
      
      const hasActiveSubscription = 
        Object.keys(newInfo.entitlements.active).length > 0 ||
        newInfo.activeSubscriptions.length > 0;
      
      setIsSubscribed(hasActiveSubscription);
      return hasActiveSubscription;
    } catch (error) {
      const purchaseError = error as PurchasesError;
      if (!purchaseError.userCancelled) {
        Alert.alert(
          "Purchase Error",
          "Unable to complete purchase. Please try again later."
        );
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      
      const hasActiveSubscription = 
        Object.keys(info.entitlements.active).length > 0 ||
        info.activeSubscriptions.length > 0;
      
      setIsSubscribed(hasActiveSubscription);

      if (hasActiveSubscription) {
        Alert.alert(
          "Purchases Restored",
          "Your subscription has been restored successfully!"
        );
      } else {
        Alert.alert(
          "No Purchases Found",
          "We couldn't find any previous purchases associated with your account."
        );
      }

      return hasActiveSubscription;
    } catch (error) {
      Alert.alert(
        "Restore Error",
        "Unable to restore purchases. Please try again later."
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkSubscription = async () => {
    await loadCustomerInfo();
  };

  return (
    <PurchaseContext.Provider
      value={{
        isSubscribed,
        isLoading,
        packages,
        customerInfo,
        purchasePackage,
        restorePurchases,
        checkSubscription,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchases() {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error("usePurchases must be used within PurchaseProvider");
  }
  return context;
}
