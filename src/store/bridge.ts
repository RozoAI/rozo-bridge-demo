import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type Address } from 'viem'

// Define types for bridge operations (previously from intentPay mock)
export interface BridgeQuote {
  id: string
  route: {
    name: string
    provider: string
  }
  fees: {
    bridgeFee: string
    gasFee: string
    totalFee: string
    protocolFee?: string
  }
  estimatedTime: string
  approvalRequired: boolean
  outputAmount: string
  minReceive: string
}

export interface BridgeStatus {
  intentId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  steps: Array<{
    name: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    txHash?: string
    timestamp?: number
    chainId?: number
  }>
  currentStep: number
  estimatedCompletion?: number
  sourceChainTxHash?: string
  destinationChainTxHash?: string
  error?: string
}

export interface BridgeFormData {
  fromChainId: number | null
  toChainId: number | null
  fromAddress: Address | null
  toAddress: string
  amount: string
  slippage: number
  memo?: string
}

export interface BridgeState {
  // Form data
  form: BridgeFormData
  
  // Quote and transaction state
  quote: BridgeQuote | null
  isQuoting: boolean
  quoteError: string | null
  
  // Transaction state
  isApproving: boolean
  approvalTxHash: string | null
  approvalError: string | null
  
  isBridging: boolean
  bridgeTxHash: string | null
  bridgeError: string | null
  intentId: string | null
  
  // Status tracking
  status: BridgeStatus | null
  isTrackingStatus: boolean
  
  // UI state
  showAdvanced: boolean
  savedRecipients: Array<{ address: Address; label: string }>
  
  // Actions
  updateForm: (updates: Partial<BridgeFormData>) => void
  setQuote: (quote: BridgeQuote | null) => void
  setQuoting: (isQuoting: boolean) => void
  setQuoteError: (error: string | null) => void
  
  setApproving: (isApproving: boolean) => void
  setApprovalTxHash: (txHash: string | null) => void
  setApprovalError: (error: string | null) => void
  
  setBridging: (isBridging: boolean) => void
  setBridgeTxHash: (txHash: string | null) => void
  setBridgeError: (error: string | null) => void
  setIntentId: (intentId: string | null) => void
  
  setStatus: (status: BridgeStatus | null) => void
  setTrackingStatus: (isTracking: boolean) => void
  
  setShowAdvanced: (show: boolean) => void
  addSavedRecipient: (recipient: { address: Address; label: string }) => void
  removeSavedRecipient: (address: Address) => void
  
  // Reset functions
  resetQuote: () => void
  resetTransaction: () => void
  resetAll: () => void
}

const initialFormData: BridgeFormData = {
  fromChainId: null,
  toChainId: null,
  fromAddress: null,
  toAddress: '',
  amount: '',
  slippage: 0.5,
  memo: '',
}

export const useBridgeStore = create<BridgeState>()(
  persist(
    (set, get) => ({
      // Initial state
      form: initialFormData,
      quote: null,
      isQuoting: false,
      quoteError: null,
      
      isApproving: false,
      approvalTxHash: null,
      approvalError: null,
      
      isBridging: false,
      bridgeTxHash: null,
      bridgeError: null,
      intentId: null,
      
      status: null,
      isTrackingStatus: false,
      
      showAdvanced: false,
      savedRecipients: [],
      
      // Form actions
      updateForm: (updates) => {
        set((state) => ({
          form: { ...state.form, ...updates }
        }))
      },
      
      // Quote actions
      setQuote: (quote) => set({ quote }),
      setQuoting: (isQuoting) => set({ isQuoting }),
      setQuoteError: (quoteError) => set({ quoteError }),
      
      // Approval actions
      setApproving: (isApproving) => set({ isApproving }),
      setApprovalTxHash: (approvalTxHash) => set({ approvalTxHash }),
      setApprovalError: (approvalError) => set({ approvalError }),
      
      // Bridge actions
      setBridging: (isBridging) => set({ isBridging }),
      setBridgeTxHash: (bridgeTxHash) => set({ bridgeTxHash }),
      setBridgeError: (bridgeError) => set({ bridgeError }),
      setIntentId: (intentId) => set({ intentId }),
      
      // Status actions
      setStatus: (status) => set({ status }),
      setTrackingStatus: (isTrackingStatus) => set({ isTrackingStatus }),
      
      // UI actions
      setShowAdvanced: (showAdvanced) => set({ showAdvanced }),
      addSavedRecipient: (recipient) => {
        const { savedRecipients } = get()
        if (!savedRecipients.find(r => r.address === recipient.address)) {
          set({ savedRecipients: [...savedRecipients, recipient] })
        }
      },
      removeSavedRecipient: (address) => {
        const { savedRecipients } = get()
        set({ savedRecipients: savedRecipients.filter(r => r.address !== address) })
      },
      
      // Reset functions
      resetQuote: () => set({
        quote: null,
        isQuoting: false,
        quoteError: null,
      }),
      
      resetTransaction: () => set({
        isApproving: false,
        approvalTxHash: null,
        approvalError: null,
        isBridging: false,
        bridgeTxHash: null,
        bridgeError: null,
        intentId: null,
        status: null,
        isTrackingStatus: false,
      }),
      
      resetAll: () => set({
        form: initialFormData,
        quote: null,
        isQuoting: false,
        quoteError: null,
        isApproving: false,
        approvalTxHash: null,
        approvalError: null,
        isBridging: false,
        bridgeTxHash: null,
        bridgeError: null,
        intentId: null,
        status: null,
        isTrackingStatus: false,
        showAdvanced: false,
      }),
    }),
    {
      name: 'bridge-store',
      // Only persist form data and saved recipients
      partialize: (state) => ({
        form: state.form,
        savedRecipients: state.savedRecipients,
        showAdvanced: state.showAdvanced,
      }),
    }
  )
)
