import type { Poem } from '../backend';

export async function generatePoemImage(poem: Poem): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Set canvas dimensions
  const width = 1200;
  const height = 1600;
  canvas.width = width;
  canvas.height = height;

  // Get computed styles from CSS variables
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  
  // Background gradient (warm earth tones)
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#f5f1e8');
  gradient.addColorStop(1, '#e8dcc8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add decorative border
  ctx.strokeStyle = '#8b6f47';
  ctx.lineWidth = 8;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // Inner border
  ctx.strokeStyle = '#a0826d';
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, width - 120, height - 120);

  // Title
  ctx.fillStyle = '#3d2817';
  ctx.font = 'bold 64px "Crimson Text", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  const titleLines = wrapText(ctx, poem.title, width - 200);
  let yPosition = 120;
  titleLines.forEach(line => {
    ctx.fillText(line, width / 2, yPosition);
    yPosition += 80;
  });

  // Decorative line
  yPosition += 20;
  ctx.strokeStyle = '#8b6f47';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 200, yPosition);
  ctx.lineTo(width / 2 + 200, yPosition);
  ctx.stroke();
  yPosition += 60;

  // Poem content
  ctx.fillStyle = '#4a3728';
  ctx.font = '36px "Lora", serif';
  ctx.textAlign = 'center';
  
  const contentLines = wrapText(ctx, poem.content, width - 240);
  const lineHeight = 52;
  
  contentLines.forEach(line => {
    if (yPosition + lineHeight < height - 300) {
      ctx.fillText(line, width / 2, yPosition);
      yPosition += lineHeight;
    }
  });

  // Author
  yPosition = height - 240;
  ctx.fillStyle = '#6b5444';
  ctx.font = 'italic 32px "Lora", serif';
  ctx.textAlign = 'center';
  ctx.fillText(`— ${poem.author}`, width / 2, yPosition);

  // Branding
  yPosition = height - 120;
  ctx.fillStyle = '#8b6f47';
  ctx.font = '28px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('International Gojri Maa Boli Adab', width / 2, yPosition);

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create blob from canvas'));
      }
    }, 'image/png');
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
