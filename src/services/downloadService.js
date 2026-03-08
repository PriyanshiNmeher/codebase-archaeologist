import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// PNG download
export const downloadAsPNG = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#1e293b'
    });
    
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Download error:', error);
    alert('Failed to download PNG');
  }
};

// PDF download
export const downloadAsPDF = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#1e293b'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width * 0.75, canvas.height * 0.75]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * 0.75, canvas.height * 0.75);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Download error:', error);
    alert('Failed to download PDF');
  }
};

// Mermaid code download
export const downloadMermaidCode = (code, filename) => {
  const blob = new Blob([code], { type: 'text/plain' });
  const link = document.createElement('a');
  link.download = `${filename}.mmd`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
};