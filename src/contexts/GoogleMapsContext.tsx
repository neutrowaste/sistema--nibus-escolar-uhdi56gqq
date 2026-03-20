import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'sonner'

interface GoogleMapsContextType {
  isLoaded: boolean
  loadError: string | null
  apiKey: string
}

const GoogleMapsContext = createContext<GoogleMapsContextType | null>(null)

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const getApiKey = () => {
    const keys = [
      import.meta.env.VITE_GOOGLE_MAPS,
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      import.meta.env.VITE_GOOGLE_MAPS_KEY,
    ]
    for (const k of keys) {
      if (k && typeof k === 'string' && k.trim() !== '' && k.trim() !== 'undefined') {
        return k.trim()
      }
    }
    return ''
  }

  const apiKey = getApiKey()

  useEffect(() => {
    if (!apiKey) {
      setLoadError(
        'Aviso: Chave de API do Google Maps ausente ou inválida. O mapa operará em modo restrito.',
      )
      return
    }

    if (window.google?.maps?.marker) {
      setIsLoaded(true)
      return
    }

    const scriptId = 'google-maps-api-script'
    if (document.getElementById(scriptId)) {
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
