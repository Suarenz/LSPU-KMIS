import prisma from '../lib/prisma';

async function checkDocument() {
  try {
    // Get the document ID from the URL in the screenshot
    const documentId = '8c21d23e-bf62-4a19-9216-b42b154f1bc6';
    
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        title: true,
        fileName: true,
        fileUrl: true,
        blobName: true,
        category: true,
        uploadedAt: true,
        isQproDocument: true,
      }
    });

    if (!document) {
      console.log('Document not found');
      return;
    }

    console.log('Document details:');
    console.log(JSON.stringify(document, null, 2));
    
    // Extract filename from URL
    const urlWithoutParams = document.fileUrl.split('?')[0];
    const extractedFromUrl = urlWithoutParams.split('/').pop();
    
    console.log('\nFilename extraction:');
    console.log('- blobName field:', document.blobName || 'NULL/EMPTY');
    console.log('- extracted from URL:', extractedFromUrl);
    console.log('- Match:', document.blobName === extractedFromUrl ? 'YES' : 'NO');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDocument();
