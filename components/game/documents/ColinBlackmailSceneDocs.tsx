import Image from 'next/image'

export const ColinBlackmailScenePage1 = () => (
  <div className="bg-white border border-[#333] p-8" style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}>
    <div className="text-center border-b-[3px] border-double border-[#333] pb-4 mb-6">
      <h1 className="text-2xl m-0 mb-1 tracking-[3px]">MARSHALL & HAYES</h1>
      <p className="text-xs my-1 italic">Fine Jewelry & Estate Auction</p>
      <p className="text-xs my-1 italic">London • Established 1847</p>
      <p className="text-xs mt-2 italic">Auction Date: 22 June 1963</p>
    </div>

    <div className="text-3xl font-bold my-5">LOT 47</div>

    <div className="text-lg font-bold mb-4">
      Victorian Gold Pocket Watch (Non-Functional)
    </div>

    <div className="relative w-full my-5 border-2 border-[#999] bg-[#e0e0e0]">
      <Image
        src="/cases/case01/images/documents/colin-watch.png"
        alt="Victorian Gold Pocket Watch - Catalog photograph showing ornate case, visibly tarnished"
        width={800}
        height={600}
        className="w-full h-auto object-contain"
        priority
      />
    </div>

    <div className="text-xl text-[#8b0000] font-bold my-5 p-2 border-t border-b border-[#999]">
      ESTIMATE: £120 - £180
    </div>

    <div className="leading-relaxed text-justify space-y-4">
      <p>
        A Victorian-era pocket watch in 18kt gold case, circa 1890s. The case features light engraving work typical of the period.
      </p>

      <p>
        The interior of the case bears the engraved inscription "T.A. 1896," suggesting this was a personal piece.
      </p>

      <p>
        <strong>Condition:</strong> Fair. The watch mechanism is non-functional and would require significant restoration. Case shows moderate wear and tarnishing. Crystal cracked. Value primarily in gold content and as a period piece.
      </p>

      <p><strong>Case Diameter:</strong> 48mm</p>

      <p>
        <strong>Note:</strong> Sold as-is for parts or restoration project. No guarantee of functionality.
      </p>
    </div>

    <div className="mt-5 p-4 bg-[#f9f9f9] border-l-4 border-[#333]">
      <p><strong>PROVENANCE:</strong> English noble estate (name withheld by consignor's request)</p>
    </div>

    <div className="text-xs mt-6 pt-4 border-t border-[#ccc] text-[#555]">
      Consigned by: C. Dorsey, Estate Representative<br />
      Contact: Marshall & Hayes, 14 Bond Street, London W1
    </div>
  </div>
)

export const ColinBlackmailScenePage2 = () => (
  <div>
    <p className="font-bold mb-4">Reginald's Note:</p>
    <div className="bg-[#e8dcc8] p-5 border border-[#8b7355] italic text-[#1a1510] leading-relaxed space-y-4" style={{ fontFamily: "var(--font-covered-by-your-grace)", fontSize: '18px' }}>
      <p>
        Uncle Thomas's old pocket watch. Broken, tarnished, worth perhaps £150 at auction. Colin tried to sell it at Marshall & Hayes, Charles spotted it in their catalog and rang me up.
      </p>

      <p>
        When I asked Colin about it, he admitted to gambling debts. Said he thought I wouldn't miss it since it was broken anyway. I suppose he's not entirely wrong, it's been sitting in a drawer for years. Still, it wasn't his to take.
      </p>

      <p>
        The watch itself? Not particularly important. But the principle troubles me. Ten years working together, and he couldn't simply ask if he needed money. Instead he goes behind my back for what amounts to pocket change.
      </p>

      <p>
        It reveals a desperation I hadn't seen in him before. A man who steals £150 from his employer is either very desperate or very foolish. I suspect Colin is the former. I've decided to keep him on, he's competent at his work, and replacing him would be a headache. But I'll be watching more carefully now.
      </p>

      <p className="mt-4">— R.A., June 1963</p>
    </div>
  </div>
)








