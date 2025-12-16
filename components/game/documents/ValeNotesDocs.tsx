export const ValeNotesPage1 = () => (
  <div className="flex justify-center items-center min-h-screen bg-[#f7f3e8] p-4 md:p-8">
    <style jsx>{`
      @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Merriweather:ital,wght@0,300;0,700;1,300&display=swap');
      
      .log-paper {
        background-color: #fcf8e8;
        border: 1px solid #d4c5a7;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
        padding: 1.5rem;
        margin: 1rem;
        min-height: 500px;
        max-width: 500px;
        width: 90%;
        transform: rotate(0.5deg);
        transition: transform 0.3s ease-in-out;
      }
      
      .handwritten {
        font-family: 'Caveat', cursive;
        font-size: 1.35rem;
        color: #2c3e50;
        line-height: 1.5;
      }
      
      .date {
        font-family: 'Caveat', cursive;
        font-weight: 400;
        color: #2c3e50;
        font-size: 1.35rem;
        margin-bottom: 0.25rem;
        border-bottom: 1px dashed #d1d5db;
        padding-bottom: 0.25rem;
      }
    `}</style>
    
    <div className="log-paper">
      {/* Entry 1: The Scene */}
      <div className="mb-6">
        <div className="date">10 May 1986</div>
        <div className="handwritten">
          R.A. — 9:10 PM. Found him. My God, what a tragedy. Dead at the foot of the Grand Stairs. Awful, terrible sight. Temple injury was instant, I&apos;d say. Poor Reginald, and God help Veronica.
        </div>
      </div>

      {/* Entry 2 */}
      <div className="mb-4">
        <div className="date">07 Apr 1986</div>
        <div className="handwritten">
          V.A. — Stress headaches are back. Typical society hostess tension. Adjusted the meds. Needs more rest than he&apos;ll ever get.
        </div>
      </div>

      {/* Entry 3 */}
      <div className="mb-4">
        <div className="date">05 Mar 1986</div>
        <div className="handwritten">
          V.A. — Quick check on her. Feeling quite well, sleeping fine. No complaints. Good to see him taking better care of himself.
        </div>
      </div>

      {/* Entry 4 */}
      <div className="mb-4">
        <div className="date">05 Feb 1986</div>
        <div className="handwritten">
          R.A. — Routine check-in. Claims he&apos;s sleeping better. BP still too high (145/95). Told him again: drop the weight, less worry.
        </div>
      </div>
      
      {/* Entry 5 */}
      <div className="mb-4">
        <div className="date">04 Jan 1986</div>
        <div className="handwritten">
          R.A. — BP stable. Told him to come back if the stress headaches return.
        </div>
      </div>
    </div>
  </div>
)

export const ValeNotesPage2 = () => (
  <div className="flex justify-center items-center min-h-screen bg-[#f7f3e8] p-4 md:p-8">
    <style jsx>{`
      @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Merriweather:ital,wght@0,300;0,700;1,300&display=swap');
      
      .log-paper {
        background-color: #fcf8e8;
        border: 1px solid #d4c5a7;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
        padding: 1.5rem;
        margin: 1rem;
        min-height: 500px;
        max-width: 500px;
        width: 90%;
        transform: rotate(-0.5deg);
        transition: transform 0.3s ease-in-out;
      }
      
      .handwritten {
        font-family: 'Caveat', cursive;
        font-size: 1.35rem;
        color: #2c3e50;
        line-height: 1.5;
      }
      
      .date {
        font-family: 'Caveat', cursive;
        font-weight: 400;
        color: #2c3e50;
        font-size: 1.35rem;
        margin-bottom: 0.25rem;
        border-bottom: 1px dashed #d1d5db;
        padding-bottom: 0.25rem;
      }
    `}</style>
    
    <div className="log-paper">
      {/* Entry 6 */}
      <div className="mb-4">
        <div className="date">09 Dec 1985</div>
        <div className="handwritten">
          V.A. — Just a flu jab. Nothing notable. Reminded her about stress management over the holidays.
        </div>
      </div>

      {/* Entry 7: The Bordeaux Note */}
      <div className="mb-6">
        <div className="date">04 Nov 1985</div>
        <div className="handwritten">
          R.A. — Tried that awful Bordeaux tonight. Immediate histamine flare—face like a tomato, head pounding 15 min. in. Told him to stick to the whites only, absolutely zero reds from now on. Fine by him, thankfully—said the estate&apos;s Sauvignon Blanc is better, anyway. Good, less fuss for me.
        </div>
      </div>

      {/* Entry 8 */}
      <div className="mb-4">
        <div className="date">05 Oct 1985</div>
        <div className="handwritten">
          R.A. — Routine check. He&apos;s still worried about the merger. Nothing much to report on the physical side. Fine.
        </div>
      </div>

      {/* Entry 9 */}
      <div className="mb-4">
        <div className="date">10 Sept 1985</div>
        <div className="handwritten">
          V.A. — Quick check on her. BP slightly elevated, but she feels fine. Told her to relax more and schedule a follow-up.
        </div>
      </div>
    </div>
  </div>
)

