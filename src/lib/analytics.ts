// Analytics and telemetry utilities
// Track user interactions for product insights

export interface AnalyticsEvent {
  event: string
  properties?: Record<string, unknown>
  timestamp?: number
}

export type BridgeEventType = 
  | 'connect_wallet'
  | 'quote_success'
  | 'quote_error'
  | 'approve_submitted'
  | 'approve_success'
  | 'approve_fail'
  | 'bridge_submitted'
  | 'bridge_success'
  | 'bridge_fail'
  | 'status_update'
  | 'recover_clicked'
  | 'chain_switch'
  | 'max_amount_clicked'
  | 'half_amount_clicked'
  | 'address_pasted'
  | 'recipient_saved'
  | 'advanced_toggled'

class Analytics {
  private static instance: Analytics
  private isEnabled: boolean = false
  private analyticsId: string | null = null

  constructor() {
    this.analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID || null
    this.isEnabled = !!this.analyticsId && typeof window !== 'undefined'
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics()
    }
    return Analytics.instance
  }

  /**
   * Track a bridge-related event
   */
  track(eventType: BridgeEventType, properties?: Record<string, unknown>): void {
    if (!this.isEnabled) {
      // In development, log to console
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics:', eventType, properties)
      }
      return
    }

    const event: AnalyticsEvent = {
      event: eventType,
      properties: {
        ...properties,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
      timestamp: Date.now(),
    }

    // Send to analytics service
    this.sendEvent(event)
  }

  /**
   * Track wallet connection
   */
  trackWalletConnect(walletType: string, chainId: number): void {
    this.track('connect_wallet', {
      wallet_type: walletType,
      chain_id: chainId,
    })
  }

  /**
   * Track successful quote
   */
  trackQuoteSuccess(
    fromChainId: number,
    toChainId: number,
    amount: string,
    route: string,
    fees: string
  ): void {
    this.track('quote_success', {
      from_chain_id: fromChainId,
      to_chain_id: toChainId,
      amount,
      route,
      fees,
    })
  }

  /**
   * Track quote error
   */
  trackQuoteError(
    fromChainId: number,
    toChainId: number,
    amount: string,
    error: string
  ): void {
    this.track('quote_error', {
      from_chain_id: fromChainId,
      to_chain_id: toChainId,
      amount,
      error,
    })
  }

  /**
   * Track approval transaction
   */
  trackApproval(status: 'submitted' | 'success' | 'fail', txHash?: string, error?: string): void {
    this.track(`approve_${status}` as BridgeEventType, {
      tx_hash: txHash,
      error,
    })
  }

  /**
   * Track bridge transaction
   */
  trackBridge(
    status: 'submitted' | 'success' | 'fail',
    intentId?: string,
    txHash?: string,
    error?: string
  ): void {
    this.track(`bridge_${status}` as BridgeEventType, {
      intent_id: intentId,
      tx_hash: txHash,
      error,
    })
  }

  /**
   * Track status updates
   */
  trackStatusUpdate(intentId: string, status: string, step?: string): void {
    this.track('status_update', {
      intent_id: intentId,
      status,
      step,
    })
  }

  /**
   * Track recovery action
   */
  trackRecovery(intentId: string, action: string): void {
    this.track('recover_clicked', {
      intent_id: intentId,
      action,
    })
  }

  /**
   * Track chain switch
   */
  trackChainSwitch(fromChainId: number, toChainId: number): void {
    this.track('chain_switch', {
      from_chain_id: fromChainId,
      to_chain_id: toChainId,
    })
  }

  /**
   * Track UI interactions
   */
  trackUIInteraction(action: 'max_clicked' | 'half_clicked' | 'address_pasted' | 'recipient_saved' | 'advanced_toggled'): void {
    const eventMap = {
      max_clicked: 'max_amount_clicked',
      half_clicked: 'half_amount_clicked',
      address_pasted: 'address_pasted',
      recipient_saved: 'recipient_saved',
      advanced_toggled: 'advanced_toggled',
    } as const

    this.track(eventMap[action], {})
  }

  /**
   * Send event to analytics service
   */
  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Replace with your analytics service endpoint
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.warn('Failed to send analytics event:', error)
    }
  }

  /**
   * Batch multiple events
   */
  private eventQueue: AnalyticsEvent[] = []
  private flushTimeout: NodeJS.Timeout | null = null

  private queueEvent(event: AnalyticsEvent): void {
    this.eventQueue.push(event)
    
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout)
    }
    
    this.flushTimeout = setTimeout(() => {
      this.flushEvents()
    }, 1000) // Batch events for 1 second
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    try {
      await fetch('/api/analytics/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      })
    } catch (error) {
      console.warn('Failed to send batched analytics events:', error)
    }
  }
}

// Export singleton instance
export const analytics = Analytics.getInstance()

// Convenience functions
export const trackWalletConnect = analytics.trackWalletConnect.bind(analytics)
export const trackQuoteSuccess = analytics.trackQuoteSuccess.bind(analytics)
export const trackQuoteError = analytics.trackQuoteError.bind(analytics)
export const trackApproval = analytics.trackApproval.bind(analytics)
export const trackBridge = analytics.trackBridge.bind(analytics)
export const trackStatusUpdate = analytics.trackStatusUpdate.bind(analytics)
export const trackRecovery = analytics.trackRecovery.bind(analytics)
export const trackChainSwitch = analytics.trackChainSwitch.bind(analytics)
export const trackUIInteraction = analytics.trackUIInteraction.bind(analytics)
