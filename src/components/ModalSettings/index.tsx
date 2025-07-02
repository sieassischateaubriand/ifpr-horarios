import React, { useContext } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Checkbox from '@radix-ui/react-checkbox'
import * as RadioGroup from '@radix-ui/react-radio-group'
import * as Slider from '@radix-ui/react-slider'
import {
  DialogClose,
  DialogContent,
  DialogTrigger,
  ScreenshotButton,
  SettingsContainer,
} from './styles'
import { RadioItem } from '../RadioItem'
import { GridContext } from '../Grid'
import { TimetableViewType } from '@site/src/reducers/settings/reducer'

export interface ModalSettingsProps {
  downloadScreenshot: () => any
}

export function ModalSettings({ downloadScreenshot }: ModalSettingsProps) {
  const { isMenuFixed, modifyMenu, timetableView, reduceGrid } =
    useContext(GridContext)

  function handleChangeMenu() {
    modifyMenu(!isMenuFixed)
  }

  function handleChangeTimetableView(newView: TimetableViewType) {
    reduceGrid(newView)
  }

  return (
    <Dialog.Root>
      <DialogTrigger>
        <span style={{ fontSize: '2rem' }}>⚙️</span>
      </DialogTrigger>
      <Dialog.Portal>
        <DialogContent>
          <header>
            <div>
              <Dialog.Title>Configurações</Dialog.Title>
              <Dialog.Description>
                Configure o horário da maneira como quiser
              </Dialog.Description>
            </div>

            <DialogClose type="button">
              <span style={{ fontSize: '1.5rem' }}>✕</span>
            </DialogClose>
          </header>

          <hr />

          <SettingsContainer>
            <div className="menuFixed">
              <Checkbox.Root
                id="menuFixed"
                defaultChecked={isMenuFixed}
                onCheckedChange={handleChangeMenu}
              >
                <Checkbox.Indicator>
                  <span style={{ fontSize: '1rem' }}>✓</span>
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label htmlFor="menuFixed">Menu fixo</label>
            </div>

            <RadioGroup.Root
              className="radioContainer"
              defaultValue={timetableView}
              onValueChange={(value: TimetableViewType) =>
                handleChangeTimetableView(value)
              }
            >
              <RadioItem title="Horário Completo" value="completed" />
              <RadioItem title="Horário Condensado" value="condensed" />
              <RadioItem
                title="Horário Super Condensado"
                value="superCondensed"
              />
            </RadioGroup.Root>

            {/* <div className="sliderContainer">
              <span>Tamanho da fonte</span>
              <Slider.Root 
                className="slider" 
                defaultValue={[14.4]} 
                min={8} 
                max={30} 
                step={1} 
                aria-label="Tamanho da fonte"
              >
                <Slider.Track className="sliderTrack">
                  <Slider.Range className="sliderRange" />
                </Slider.Track>
                <Slider.Thumb className="sliderThumb" />
              </Slider.Root>
            </div> */}
          </SettingsContainer>

          <hr />
          <footer>
            <Dialog.Description>
              Caso queira ter o horário como uma imagem
            </Dialog.Description>
            <ScreenshotButton
              onClick={downloadScreenshot}
              title="Download do horário como imagem"
            >
              <span style={{ fontSize: '25px' }}>📷</span>
            </ScreenshotButton>
          </footer>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
