
import React, { useState, useRef } from 'react';
import { QrCode, Download, Copy, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import AnimatedTransition from './AnimatedTransition';

interface QRCodeGeneratorProps {
  value: string;
  stallName: string;
  size?: number;
  downloadFileName?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  stallName,
  size = 200,
  downloadFileName = 'qrcode',
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const generateQrCode = async () => {
      try {
        setIsLoading(true);
        // In a real app, we'd use a QR code library directly
        // For this mockup, we'll use a public API to generate the QR code
        const encodedValue = encodeURIComponent(value);
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedValue}`;
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
        toast({
          title: 'Error',
          description: 'Failed to generate QR code. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateQrCode();
  }, [value, size]);

  const handleDownload = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${downloadFileName || stallName.replace(/\s+/g, '-').toLowerCase()}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Downloaded',
      description: 'QR code has been downloaded successfully.',
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(value);
    toast({
      title: 'Copied',
      description: 'Link copied to clipboard.',
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${stallName} - Order Online`,
          text: `Order online from ${stallName}`,
          url: value,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <AnimatedTransition animation="slide" className="text-center space-y-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{stallName} QR Code</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Scan this QR code to access the digital menu
            </p>
          </div>

          <div 
            ref={canvasRef} 
            className="flex justify-center items-center bg-white p-4 rounded-lg mx-auto"
            style={{ maxWidth: `${size}px`, maxHeight: `${size}px` }}
          >
            {isLoading ? (
              <div className="animate-pulse flex items-center justify-center" style={{ width: size, height: size }}>
                <QrCode className="w-12 h-12 text-gray-300" />
              </div>
            ) : (
              <img 
                src={qrCodeUrl} 
                alt={`QR Code for ${stallName}`} 
                className="max-w-full rounded shadow-sm"
              />
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyLink} disabled={isLoading}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} disabled={isLoading}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </AnimatedTransition>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
