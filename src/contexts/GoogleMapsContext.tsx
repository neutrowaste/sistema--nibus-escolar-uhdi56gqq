import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

interface GoogleMapsContextType {
  isLoaded: boolean
  loadError: string | null
  apiKey: string
}

const GoogleMapsContext = createContext<GoogleMapsContextType | null>(null)

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string>('')

  useEffect(() => {
    let mounted = true

    async function fetchKey() {
      const keys = [
        import.meta.env.VITE_GOOGLE_MAPS,
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        import.meta.env.VITE_GOOGLE_MAPS_KEY,
      ]

      let foundKey = keys.find(
        (k) => k && typeof k === 'string' && k.trim() !== '' && k.trim() !== 'undefined',
      )

      if (!foundKey) {
        try {
          const { data, error } = await supabase.functions.invoke('get-maps-config')
          if (!error && data?.apiKey) {
            foundKey = data.apiKey.trim()
          }
        } catch (err) {
          console.error('Failed to fetch maps config from edge function:', err)
        }
      }

      if (!mounted) return

      if (!foundKey) {
        setLoadError(
          'Aviso: Chave de API do Google Maps ausente nos secrets e variáveis de ambiente.',
        )
        return
      }

      setApiKey(foundKey)
    }

    fetchKey()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!apiKey) return

    if (window.google?.maps?.marker) {
      setIsLoaded(true)
      return
    }

    const scriptId = 'google-maps-api-script'
    if (document.getElementById(scriptId)) {
      if (window.google?.maps?.marker) {
        setIsLoaded(true)
      }
      return
    }

    window.initGoogleMaps = () => {
      setIsLoaded(true)
    }

    window.gm_authFailure = () => {
      setLoadError('Falha na autenticação da chave do Google Maps (ApiProjectMapError).')
      toast.error('Erro de autenticação no Google Maps. Verifique as restrições da sua API Key.')
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,marker&loading=async&callback=initGoogleMaps`
    script.async = true
    script.defer = true
    script.onerror = () => {
      setLoadError('Erro na rede ao carregar o script do Google Maps.')
    }
    document.head.appendChild(script)
  }, [apiKey])

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError, apiKey }}>
      {children}
    </GoogleMapsContext.Provider>
  )
}

export const useGoogleMaps = () => {
  const ctx = useContext(GoogleMapsContext)
  if (!ctx) throw new Error('useGoogleMaps must be used within GoogleMapsProvider')
  return ctx
}
