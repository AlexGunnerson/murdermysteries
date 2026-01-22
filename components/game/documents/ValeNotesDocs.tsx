export const ValeNotesPage1 = () => (
  <div className="journal-page">
    <style jsx>{`
      @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');
      
      .journal-page {
        font-family: 'Caveat', cursive;
        background-color: #f5f0e8;
        background-image: 
          url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E"),
          linear-gradient(to bottom right, rgba(255,255,255,0.4), rgba(139,115,85,0.05));
        padding: 45px 40px 70px 40px;
        position: relative;
        min-height: 600px;
      }
      
      .journal-header {
        text-align: center;
        border-bottom: 2px solid #8b7355;
        padding-bottom: 10px;
        margin-bottom: 25px;
        opacity: 0.8;
      }
      
      .journal-title {
        font-size: 1.8rem;
        font-weight: 700;
        color: #3a3a3a;
        margin-bottom: 5px;
      }
      
      .journal-subtitle {
        font-size: 1rem;
        color: #666;
        font-weight: 400;
      }
      
      .entry {
        margin-bottom: 1.5rem;
        position: relative;
      }
      
      .entry-date {
        font-weight: 700;
        color: #2a2a2a;
        font-size: 1.3rem;
        margin-bottom: 0.3rem;
      }
      
      .entry-text {
        font-size: 1.25rem;
        color: #2a2a2a;
        line-height: 1.6;
        text-shadow: 0 0 1px rgba(42, 42, 42, 0.1);
      }
    `}</style>
    
    <div className="journal-header">
      <div className="journal-title">Medical Notes</div>
      <div className="journal-subtitle">Dr. Leonard Vale</div>
    </div>

    {/* Entry 1: The Scene */}
    <div className="entry">
      <div className="entry-date">10 May 1986</div>
      <div className="entry-text">
        R.A. — 9:10 PM. Found him. My God, what a tragedy. Dead at the foot of the Grand Stairs. Awful, terrible sight. Temple injury was instant, I'd say. Poor Reginald, and God help Veronica.
      </div>
    </div>

    {/* Entry 2 */}
    <div className="entry">
      <div className="entry-date">07 Apr 1986</div>
      <div className="entry-text">
        V.A. — Stress headaches are back. Typical society hostess tension. Adjusted the meds. Needs more rest than he'll ever get.
      </div>
    </div>

    {/* Entry 3 */}
    <div className="entry">
      <div className="entry-date">05 Mar 1986</div>
      <div className="entry-text">
        V.A. — Quick check on her. Feeling quite well, sleeping fine. No complaints. Good to see him taking better care of himself.
      </div>
    </div>

    {/* Entry 4 */}
    <div className="entry">
      <div className="entry-date">05 Feb 1986</div>
      <div className="entry-text">
        R.A. — Routine check-in. Claims he's sleeping better. BP still too high (145/95). Told him again: drop the weight, less worry.
      </div>
    </div>
    
    {/* Entry 5 */}
    <div className="entry">
      <div className="entry-date">04 Jan 1986</div>
      <div className="entry-text">
        R.A. — BP stable. Told him to come back if the stress headaches return.
      </div>
    </div>
  </div>
)

export const ValeNotesPage2 = () => (
  <div className="journal-page">
    <style jsx>{`
      @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');
      
      .journal-page {
        font-family: 'Caveat', cursive;
        background-color: #f5f0e8;
        background-image: 
          url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E"),
          linear-gradient(to bottom right, rgba(255,255,255,0.4), rgba(139,115,85,0.05));
        padding: 45px 40px 70px 40px;
        position: relative;
        min-height: 600px;
      }
      
      .entry {
        margin-bottom: 1.5rem;
        position: relative;
      }
      
      .entry-date {
        font-weight: 700;
        color: #2a2a2a;
        font-size: 1.3rem;
        margin-bottom: 0.3rem;
      }
      
      .entry-text {
        font-size: 1.25rem;
        color: #2a2a2a;
        line-height: 1.6;
        text-shadow: 0 0 1px rgba(42, 42, 42, 0.1);
      }
      
      .signature-block {
        margin-top: 3rem;
        text-align: right;
      }
      
      .signature {
        font-size: 1.8rem;
        font-weight: 700;
        color: #3a3a3a;
        transform: rotate(-2deg);
        display: inline-block;
      }
    `}</style>
    
    {/* Entry 6 */}
    <div className="entry">
      <div className="entry-date">09 Dec 1985</div>
      <div className="entry-text">
        V.A. — Just a flu jab. Nothing notable. Reminded her about stress management over the holidays.
      </div>
    </div>

    {/* Entry 7: The Bordeaux Note */}
    <div className="entry">
      <div className="entry-date">04 Nov 1985</div>
      <div className="entry-text">
        R.A. — Tried that awful Bordeaux tonight. Immediate histamine flare—face like a tomato, head pounding 15 min. in. Told him to stick to the whites only, absolutely zero reds from now on. Fine by him, thankfully—said the estate's Sauvignon Blanc is better, anyway. Good, less fuss for me.
      </div>
    </div>

    {/* Entry 8 */}
    <div className="entry">
      <div className="entry-date">05 Oct 1985</div>
      <div className="entry-text">
        R.A. — Routine check. He's still worried about the merger. Nothing much to report on the physical side. Fine.
      </div>
    </div>

    {/* Entry 9 */}
    <div className="entry">
      <div className="entry-date">10 Sept 1985</div>
      <div className="entry-text">
        V.A. — Quick check on her. BP slightly elevated, but she feels fine. Told her to relax more and schedule a follow-up.
      </div>
    </div>

    <div className="signature-block">
      <div className="signature">— Dr. L. Vale</div>
    </div>
  </div>
)






