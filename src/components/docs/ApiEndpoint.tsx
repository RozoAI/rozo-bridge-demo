'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CodeBlock } from './CodeBlock'

interface ApiEndpointProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  title: string
  description: string
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
  requestBody?: {
    type: string
    example: string
  }
  responses?: Array<{
    status: number
    description: string
    example?: string
  }>
}

const methodColors = {
  GET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

export function ApiEndpoint({ 
  method, 
  path, 
  title, 
  description, 
  parameters, 
  requestBody, 
  responses 
}: ApiEndpointProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Badge className={methodColors[method]} variant="secondary">
            {method}
          </Badge>
          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
            {path}
          </code>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {parameters && parameters.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Parameters</h4>
            <div className="space-y-3">
              {parameters.map((param) => (
                <div key={param.name} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono">{param.name}</code>
                    <Badge variant={param.required ? 'destructive' : 'secondary'} className="text-xs">
                      {param.required ? 'required' : 'optional'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{param.type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{param.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {requestBody && (
          <div>
            <h4 className="font-semibold mb-3">Request Body</h4>
            <p className="text-sm text-muted-foreground mb-3">Type: {requestBody.type}</p>
            <CodeBlock 
              code={requestBody.example} 
              language="json" 
              title="Example Request"
            />
          </div>
        )}

        {responses && responses.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Responses</h4>
            <div className="space-y-4">
              {responses.map((response) => (
                <div key={response.status}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={response.status < 300 ? 'default' : 'destructive'}>
                      {response.status}
                    </Badge>
                    <span className="text-sm">{response.description}</span>
                  </div>
                  {response.example && (
                    <CodeBlock 
                      code={response.example} 
                      language="json" 
                      title={`${response.status} Response`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}