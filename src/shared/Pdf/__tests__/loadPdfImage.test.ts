import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadFirstPdfImage, loadPdfImage } from '../loadPdfImage';

describe('PDF image loading', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns embedded images without a network request', async () => {
    const fetchImage = vi.fn();
    vi.stubGlobal('fetch', fetchImage);

    await expect(loadPdfImage('data:image/png;base64,logo')).resolves.toBe(
      'data:image/png;base64,logo',
    );
    expect(fetchImage).not.toHaveBeenCalled();
  });

  it('loads a remote image as bytes', async () => {
    const imageBytes = new Uint8Array([137, 80, 78, 71]);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(imageBytes.buffer),
      }),
    );

    await expect(loadPdfImage('https://assets.test/company.png')).resolves.toEqual(imageBytes);
  });

  it('uses the next image when a requested image is unavailable', async () => {
    const fallbackBytes = new Uint8Array([255, 216, 255]);
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: () => Promise.resolve(fallbackBytes.buffer),
        }),
    );

    await expect(
      loadFirstPdfImage(['/missing-project.webp', '/assets/default-project.png']),
    ).resolves.toEqual(fallbackBytes);
  });
});
