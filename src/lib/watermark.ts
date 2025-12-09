import sharp from 'sharp'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Adiciona marca d'água com o logo GEREZIM em uma imagem
 * 
 * @param imageBuffer - Buffer da imagem original
 * @param filename - Nome do arquivo (para log)
 * @returns Buffer da imagem com watermark
 */
export async function addWatermark(
  imageBuffer: Buffer,
  filename: string = 'image.jpg'
): Promise<Buffer> {
  try {
    // Caminho do logo GEREZIM
    const logoPath = join(process.cwd(), 'public', 'logo-novo-gme.png')

    // Verificar se o logo existe
    if (!existsSync(logoPath)) {
      console.warn(`Logo não encontrado em ${logoPath}. Retornando imagem original.`)
      return imageBuffer
    }

    // Ler o logo
    const logoBuffer = readFileSync(logoPath)

    // Obter informações da imagem original
    const imageMetadata = await sharp(imageBuffer).metadata()
    
    if (!imageMetadata.width || !imageMetadata.height) {
      console.warn('Não foi possível obter dimensões da imagem')
      return imageBuffer
    }

    // Calcular tamanho do watermark (10% da largura da imagem)
    const watermarkWidth = Math.round(imageMetadata.width * 0.1)

    // Processar o logo para o tamanho correto mantendo proporção
    const resizedLogo = await sharp(logoBuffer)
      .resize(watermarkWidth, watermarkWidth, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Fundo transparente
      })
      .png()
      .toBuffer()

    // Calcular posição (canto inferior direito com margem de 5px)
    const margin = 5
    const positionX = imageMetadata.width - watermarkWidth - margin
    const positionY = imageMetadata.height - watermarkWidth - margin

    // Aplicar watermark com opacidade 85%
    const watermarkedImage = await sharp(imageBuffer)
      .composite([
        {
          input: resizedLogo,
          left: positionX,
          top: positionY,
          blend: 'over' // Blender mode
        }
      ])
      .toBuffer()

    return watermarkedImage
  } catch (error) {
    console.error('Erro ao adicionar watermark:', error)
    // Retornar imagem original em caso de erro
    return imageBuffer
  }
}

/**
 * Adiciona watermark com opacidade ajustada
 * 
 * @param imageBuffer - Buffer da imagem original
 * @param filename - Nome do arquivo
 * @param opacity - Opacidade (0-100), padrão 85
 * @returns Buffer da imagem com watermark
 */
export async function addWatermarkWithOpacity(
  imageBuffer: Buffer,
  filename: string = 'image.jpg',
  opacity: number = 85
): Promise<Buffer> {
  try {
    // Caminho do logo GEREZIM
    const logoPath = join(process.cwd(), 'public', 'logo-novo-gme.png')

    // Verificar se o logo existe
    if (!existsSync(logoPath)) {
      console.warn(`Logo não encontrado em ${logoPath}. Retornando imagem original.`)
      return imageBuffer
    }

    // Ler o logo
    const logoBuffer = readFileSync(logoPath)

    // Obter informações da imagem original
    const imageMetadata = await sharp(imageBuffer).metadata()
    
    if (!imageMetadata.width || !imageMetadata.height) {
      console.warn('Não foi possível obter dimensões da imagem')
      return imageBuffer
    }

    // Calcular tamanho do watermark (10% da largura da imagem)
    const watermarkWidth = Math.round(imageMetadata.width * 0.1)

    // Converter opacidade percentual para valor de 0-1
    const alphaValue = opacity / 100

    // Processar o logo para o tamanho correto com opacidade
    const resizedLogo = await sharp(logoBuffer)
      .resize(watermarkWidth, watermarkWidth, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .composite([
        {
          input: Buffer.from([0, 0, 0, Math.round(255 * (1 - alphaValue))]),
          raw: { width: 1, height: 1, channels: 4 },
          tile: true,
          blend: 'multiply'
        }
      ])
      .png()
      .toBuffer()

    // Calcular posição (canto inferior direito com margem de 5px)
    const margin = 5
    const positionX = imageMetadata.width - watermarkWidth - margin
    const positionY = imageMetadata.height - watermarkWidth - margin

    // Aplicar watermark
    const watermarkedImage = await sharp(imageBuffer)
      .composite([
        {
          input: resizedLogo,
          left: positionX,
          top: positionY,
          blend: 'over'
        }
      ])
      .toBuffer()

    return watermarkedImage
  } catch (error) {
    console.error('Erro ao adicionar watermark com opacidade:', error)
    return imageBuffer
  }
}
