'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IntentPayBridge } from './IntentPayBridge'
import { TopupFlow } from './TopupFlow'

export function Bridge() {
  return (
    <Tabs defaultValue="topup" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="topup">Quick Top Up</TabsTrigger>
        <TabsTrigger value="manual">Manual Transfer</TabsTrigger>
      </TabsList>
      
      <TabsContent value="topup" className="space-y-4">
        <TopupFlow />
      </TabsContent>
      
      <TabsContent value="manual" className="space-y-4">
        <IntentPayBridge />
      </TabsContent>
    </Tabs>
  )
}