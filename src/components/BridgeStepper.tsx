'use client'

import { useState } from 'react'
import { Check, Clock, ExternalLink, AlertCircle, Copy, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type BridgeStatus } from '@/store/bridge'
import { getChainById } from '@/lib/chains'

import { trackRecovery } from '@/lib/analytics'
import { cn } from '@/lib/utils'

interface BridgeStepperProps {
  status: BridgeStatus
  onRetry?: () => void
  onRefresh?: () => void
  className?: string
}

export function BridgeStepper({
  status,
  onRetry,
  onRefresh,
  className,
}: BridgeStepperProps) {
  const [copiedTx, setCopiedTx] = useState<string | null>(null)

  const getStepIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
    }
  }

  const getStepColor = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return 'bg-green-500'
      case 'processing':
        return 'bg-blue-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-muted'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default' as const
      case 'failed':
        return 'destructive' as const
      case 'processing':
      case 'initiated':
      case 'attested':
        return 'secondary' as const
      default:
        return 'outline' as const
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedTx(text)
      setTimeout(() => setCopiedTx(null), 2000)
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error)
    }
  }

  const getExplorerUrl = (txHash: string, chainId: number) => {
    const chain = getChainById(chainId)
    return chain ? `${chain.explorerUrl}/tx/${txHash}` : '#'
  }

  const completedSteps = status.steps.filter(step => step.status === 'completed').length
  const totalSteps = status.steps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  const canRetry = status.status === 'failed' || status.steps.some(step => step.status === 'failed')
  const isCompleted = status.status === 'completed'
  const isFailed = status.status === 'failed'

  return (
    <TooltipProvider>
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Intent Execution Status</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(status.status)} className="capitalize">
                {status.status.replace('_', ' ')}
              </Badge>
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{completedSteps} of {totalSteps} steps completed</span>
              <span>{progressPercentage.toFixed(0)}%</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Intent ID */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <div className="text-sm font-medium">Intent ID</div>
              <div className="text-xs text-muted-foreground font-mono">
                {status.intentId}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(status.intentId)}
              className="h-8 w-8 p-0"
            >
              {copiedTx === status.intentId ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {status.steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < status.steps.length - 1 && (
                  <div
                    className={cn(
                      'absolute left-6 top-8 w-0.5 h-6 -translate-x-1/2',
                      step.status === 'completed' ? 'bg-green-500' : 'bg-muted'
                    )}
                  />
                )}

                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  {/* Step Icon */}
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center',
                    getStepColor(step.status)
                  )}>
                    {getStepIcon(step.status)}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{step.name}</h4>
                      {step.status === 'processing' && (
                        <Badge variant="secondary" className="text-xs">
                          Processing...
                        </Badge>
                      )}
                    </div>

                    {/* Transaction Hash */}
                    {step.txHash && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="text-xs text-muted-foreground font-mono truncate">
                          {step.txHash}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(step.txHash!)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedTx === step.txHash ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                          {step.chainId && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="h-6 w-6 p-0"
                                >
                                  <a
                                    href={getExplorerUrl(step.txHash, step.chainId)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View on {getChainById(step.chainId)?.name} Explorer</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    {step.timestamp && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(step.timestamp).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Transaction Hashes */}
          {(status.sourceChainTxHash || status.destinationChainTxHash) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Transaction Hashes</h4>
                
                {status.sourceChainTxHash && (
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <div>
                      <div className="text-xs font-medium">Payin Chain</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {status.sourceChainTxHash}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(status.sourceChainTxHash!)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedTx === status.sourceChainTxHash ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-6 w-6 p-0"
                      >
                        <a
                          href={getExplorerUrl(status.sourceChainTxHash, status.steps[0]?.chainId || 1)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {status.destinationChainTxHash && (
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <div>
                      <div className="text-xs font-medium">Payout Chain</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {status.destinationChainTxHash}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(status.destinationChainTxHash!)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedTx === status.destinationChainTxHash ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-6 w-6 p-0"
                      >
                        <a
                          href={getExplorerUrl(status.destinationChainTxHash, status.steps[status.steps.length - 1]?.chainId || 137)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Error Message */}
          {status.error && (
            <>
              <Separator />
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-400 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-500">
                  {status.error}
                </p>
              </div>
            </>
          )}

          {/* Action Buttons */}
          {(canRetry || isFailed) && onRetry && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  onRetry()
                  trackRecovery(status.intentId, 'retry')
                }}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Copy recovery data or show support modal
                  const recoveryData = {
                    intentId: status.intentId,
                    sourceChainTxHash: status.sourceChainTxHash,
                    destinationChainTxHash: status.destinationChainTxHash,
                    error: status.error,
                  }
                  copyToClipboard(JSON.stringify(recoveryData, null, 2))
                  trackRecovery(status.intentId, 'copy_recovery_data')
                }}
                className="flex-1"
              >
                Copy Recovery Data
              </Button>
            </div>
          )}

          {isCompleted && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-400">
                <Check className="h-4 w-4" />
                <span className="font-medium">Intent executed successfully!</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                Your USDC has been successfully transferred to the payout chain.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
