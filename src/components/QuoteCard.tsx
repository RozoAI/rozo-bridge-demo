'use client'

import { Clock, ArrowRight, Info, Zap, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
// import { type BridgeQuote } from '@/lib/intentPay' // Using Intent Pay SDK now
import { getChainById } from '@/lib/chains'
import { formatTokenAmount, formatDuration, formatUsdAmount } from '@/lib/validation'
import { cn } from '@/lib/utils'

interface QuoteCardProps {
  quote: BridgeQuote
  fromChainId: number
  toChainId: number
  amount: string
  onAccept: () => void
  onReject: () => void
  isAccepting?: boolean
  disabled?: boolean
  className?: string
}

export function QuoteCard({
  quote,
  fromChainId,
  toChainId,
  amount,
  onAccept,
  onReject,
  isAccepting = false,
  disabled = false,
  className,
}: QuoteCardProps) {
  const fromChain = getChainById(fromChainId)
  const toChain = getChainById(toChainId)

  const totalFees = parseFloat(quote.fees.bridgeFee) + parseFloat(quote.fees.gasFee) + 
    (quote.fees.protocolFee ? parseFloat(quote.fees.protocolFee) : 0)

  const feePercentage = (totalFees / parseFloat(amount)) * 100

  return (
    <TooltipProvider>
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Intent Quote</CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {quote.route.name}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            No commission fees - only gas and protocol costs
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Route Overview */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {fromChain?.name.charAt(0)}
                </div>
                <span className="font-medium">{fromChain?.name}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  {toChain?.name.charAt(0)}
                </div>
                <span className="font-medium">{toChain?.name}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-lg font-semibold">
                {formatTokenAmount(amount)} USDC
              </div>
              <div className="text-sm text-muted-foreground">
                {formatUsdAmount(amount)}
              </div>
            </div>
          </div>

          {/* Fees Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Intent Execution Fee</span>
              <span className="font-mono">{formatTokenAmount(quote.fees.bridgeFee)} USDC</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Gas Fee</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Estimated gas cost for payin and payout transactions</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="font-mono">{formatTokenAmount(quote.fees.gasFee)} USDC</span>
            </div>

            {quote.fees.protocolFee && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Protocol Fee</span>
                <span className="font-mono">{formatTokenAmount(quote.fees.protocolFee)} USDC</span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
              <span>Commission Fee</span>
              <span className="font-mono">0.00 USDC</span>
            </div>

            <Separator />

            <div className="flex items-center justify-between font-medium">
              <span>Total Fees</span>
              <div className="text-right">
                <div className="font-mono">{formatTokenAmount(totalFees.toString())} USDC</div>
                <div className="text-xs text-muted-foreground">
                  {feePercentage.toFixed(2)}% of amount
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Receive Amount */}
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <span className="font-medium">You&apos;ll receive</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Minimum amount after fees and slippage</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-right">
              <div className="font-mono text-lg font-semibold text-green-700 dark:text-green-400">
                {formatTokenAmount(quote.minReceive)} USDC
              </div>
              <div className="text-sm text-muted-foreground">
                {formatUsdAmount(quote.minReceive)}
              </div>
            </div>
          </div>

          {/* Timing */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Estimated Time</span>
            </div>
            <span className="font-medium">{formatDuration(quote.estimatedTime)}</span>
          </div>

          {/* Approval Required */}
          {quote.approvalRequired && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">Token approval required</span>
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
                You&apos;ll need to approve USDC spending before intent execution
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onReject}
              disabled={disabled || isAccepting}
              className="flex-1"
            >
              Get New Quote
            </Button>
            <Button
              onClick={onAccept}
              disabled={disabled || isAccepting}
              className="flex-1"
            >
              {isAccepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {quote.approvalRequired ? 'Approve & Execute Intent' : 'Execute Intent'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}


