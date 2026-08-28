import { Footprints, Square } from 'lucide-react'
import { BottomSheet, Button } from '../ds'
import { formatDistance } from './geo'

/**
 * „Chyba już wróciłeś": pytanie zadawane samo, gdy oddalisz się od miejsca
 * o kilometr i nie wracasz.
 *
 * Powód jest praktyczny (zgłoszenie Jarka): spacer kończy się zwykle w aucie,
 * a nagrywanie leci dalej, więc do dziennika trafia trasa z powrotem przez pół
 * miasta. Odpowiedź „tak" zapisuje wyprawę TAKĄ, jaka była na miejscu:
 * kontroler pamięta, ile śladu powstało, zanim wyszedłeś.
 *
 * Arkusza nie da się zamknąć w bok bez odpowiedzi, bo cicha zgoda oznaczałaby
 * tutaj zapisanie złych danych. „Jeszcze wracam" jest pełnoprawnym wyjściem.
 */
export function FarAwaySheet({
  parkName,
  distance,
  onKeepWalking,
  onFinish,
}: {
  parkName: string
  distance: number
  onKeepWalking: () => void
  onFinish: () => void
}) {
  return (
    <BottomSheet open modal onClose={onKeepWalking} title="Kończymy wyprawę?">
      <div className="faraway">
        <p className="t-body faraway__lead">
          Jesteś już {formatDistance(distance)} od miejsca „{parkName}" i nie wracasz. Jeśli spacer
          się skończył, zapiszemy go bez drogi powrotnej.
        </p>
        <p className="t-caption faraway__note">
          Nagrywanie leci dalej, dopóki nie odpowiesz, więc jazda autem dopisałaby się do trasy.
        </p>
        <div className="faraway__actions">
          <Button full size="lg" icon={<Square size={18} />} onClick={onFinish}>
            Tak, zakończ
          </Button>
          <Button full size="lg" variant="tonal" icon={<Footprints size={18} />} onClick={onKeepWalking}>
            Jeszcze wracam
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
