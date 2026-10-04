import { describe, expect, it, vi } from 'vitest';
import {
  attachmentExtension,
  attachmentKind,
  downloadAttachment,
  toGalleryAttachment,
} from './attachmentGallery';

describe('attachment media rules', () => {
  it.each([
    ['https://cdn.example.com/photo.jpg?token=abc', 'image'],
    ['https://cdn.example.com/quote.pdf#page=2', 'pdf'],
    ['https://cdn.example.com/demo.mp4', 'video'],
    ['https://cdn.example.com/archive.zip', 'file'],
  ] as const)('identifies %s as %s', (url, kind) => {
    expect(attachmentKind(toGalleryAttachment({ url }))).toBe(kind);
  });

  it('uses the MIME type before the backend type and extension', () => {
    expect(
      attachmentKind({
        url: '/image.jpg',
        name: 'image.jpg',
        mimeType: 'application/pdf',
        type: 1,
      }),
    ).toBe('pdf');
    expect(
      attachmentKind({
        url: '/image.jpg',
        name: 'image.jpg',
        mimeType: 'application/zip',
        type: 1,
      }),
    ).toBe('file');
    expect(attachmentExtension('image.jpg?token=abc')).toBe('jpg');
  });

  it('resolves backend paths and rejects unsafe URL schemes', () => {
    expect(toGalleryAttachment({ file: '/attachments/report.pdf?token=abc' }).url).toMatch(
      /^https?:\/\/[^/]+\/attachments\/report\.pdf\?token=abc$/,
    );
    expect(toGalleryAttachment({ file: 'javascript:alert(1)' }).url).toBe('');
  });

  it('uses the existing URL and original filename without opening a tab', async () => {
    let clickedLink: { href: string; download: string; target: string } | undefined;
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      clickedLink = { href: this.href, download: this.download, target: this.target };
    });

    try {
      await downloadAttachment({ url: 'https://cdn.example.com/report.pdf', name: 'report.pdf' });

      expect(clickedLink).toEqual({
        href: 'https://cdn.example.com/report.pdf',
        download: 'report.pdf',
        target: '',
      });
      expect(document.querySelector('a[download="report.pdf"]')).toBeNull();
    } finally {
      clickSpy.mockRestore();
    }
  });

  it('uses the URL filename when the attachment has no name', async () => {
    let downloadedName = '';
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      downloadedName = this.download;
    });

    try {
      await downloadAttachment({ url: 'https://cdn.example.com/report.pdf?token=abc', name: '' });
      expect(downloadedName).toBe('report.pdf');
    } finally {
      clickSpy.mockRestore();
    }
  });

  it('removes the temporary link if the browser click fails', async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      throw new Error('Click failed');
    });

    try {
      await expect(
        downloadAttachment({ url: 'https://cdn.example.com/report.pdf', name: 'report.pdf' }),
      ).rejects.toThrow('Click failed');
      expect(document.querySelector('a[download="report.pdf"]')).toBeNull();
    } finally {
      clickSpy.mockRestore();
    }
  });
});
