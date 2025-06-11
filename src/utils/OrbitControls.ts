import * as THREE from 'three'

export class OrbitControls {
  private camera: THREE.PerspectiveCamera
  private domElement: HTMLElement
  private target: THREE.Vector3
  private spherical: THREE.Spherical
  private sphericalDelta: THREE.Spherical
  private scale: number
  private panOffset: THREE.Vector3
  private zoomChanged: boolean
  private rotateStart: THREE.Vector2
  private rotateEnd: THREE.Vector2
  private rotateDelta: THREE.Vector2
  private panStart: THREE.Vector2
  private panEnd: THREE.Vector2
  private panDelta: THREE.Vector2
  private dollyStart: THREE.Vector2
  private dollyEnd: THREE.Vector2
  private dollyDelta: THREE.Vector2
  private state: 'NONE' | 'ROTATE' | 'DOLLY' | 'PAN'
  private enabled: boolean
  private enableRotate: boolean
  private enableZoom: boolean
  private enablePan: boolean
  private rotateSpeed: number
  private zoomSpeed: number
  private panSpeed: number
  private minDistance: number
  private maxDistance: number
  private minPolarAngle: number
  private maxPolarAngle: number
  private minAzimuthAngle: number
  private maxAzimuthAngle: number
  private enableDamping: boolean
  private dampingFactor: number

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera
    this.domElement = domElement
    this.target = new THREE.Vector3()
    this.spherical = new THREE.Spherical()
    this.sphericalDelta = new THREE.Spherical()
    this.scale = 1
    this.panOffset = new THREE.Vector3()
    this.zoomChanged = false

    this.rotateStart = new THREE.Vector2()
    this.rotateEnd = new THREE.Vector2()
    this.rotateDelta = new THREE.Vector2()
    this.panStart = new THREE.Vector2()
    this.panEnd = new THREE.Vector2()
    this.panDelta = new THREE.Vector2()
    this.dollyStart = new THREE.Vector2()
    this.dollyEnd = new THREE.Vector2()
    this.dollyDelta = new THREE.Vector2()

    this.state = 'NONE'
    this.enabled = true
    this.enableRotate = true
    this.enableZoom = true
    this.enablePan = true
    this.rotateSpeed = 1.0
    this.zoomSpeed = 1.0
    this.panSpeed = 1.0
    this.minDistance = 0
    this.maxDistance = Infinity
    this.minPolarAngle = 0
    this.maxPolarAngle = Math.PI
    this.minAzimuthAngle = -Infinity
    this.maxAzimuthAngle = Infinity
    this.enableDamping = false
    this.dampingFactor = 0.05

    this.addEventListeners()
    this.update()
  }

  private addEventListeners() {
    this.domElement.addEventListener('contextmenu', this.onContextMenu.bind(this))
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this))
    this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this))
    this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this))
    this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this))
    this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this))
  }

  private removeEventListeners() {
    this.domElement.removeEventListener('contextmenu', this.onContextMenu.bind(this))
    this.domElement.removeEventListener('mousedown', this.onMouseDown.bind(this))
    this.domElement.removeEventListener('wheel', this.onMouseWheel.bind(this))
    this.domElement.removeEventListener('touchstart', this.onTouchStart.bind(this))
    this.domElement.removeEventListener('touchend', this.onTouchEnd.bind(this))
    this.domElement.removeEventListener('touchmove', this.onTouchMove.bind(this))
  }

  private onContextMenu(event: Event) {
    if (!this.enabled) return
    event.preventDefault()
  }

  private onMouseDown(event: MouseEvent) {
    if (!this.enabled) return

    event.preventDefault()

    if (event.button === 0) {
      if (!this.enableRotate) return
      this.handleMouseDownRotate(event)
      this.state = 'ROTATE'
    } else if (event.button === 1) {
      if (!this.enableZoom) return
      this.handleMouseDownDolly(event)
      this.state = 'DOLLY'
    } else if (event.button === 2) {
      if (!this.enablePan) return
      this.handleMouseDownPan(event)
      this.state = 'PAN'
    }

    if (this.state !== 'NONE') {
      document.addEventListener('mousemove', this.onMouseMove.bind(this))
      document.addEventListener('mouseup', this.onMouseUp.bind(this))
    }
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.enabled) return

    event.preventDefault()

    if (this.state === 'ROTATE') {
      if (!this.enableRotate) return
      this.handleMouseMoveRotate(event)
    } else if (this.state === 'DOLLY') {
      if (!this.enableZoom) return
      this.handleMouseMoveDolly(event)
    } else if (this.state === 'PAN') {
      if (!this.enablePan) return
      this.handleMouseMovePan(event)
    }
  }

  private onMouseUp() {
    if (!this.enabled) return

    document.removeEventListener('mousemove', this.onMouseMove.bind(this))
    document.removeEventListener('mouseup', this.onMouseUp.bind(this))

    this.state = 'NONE'
  }

  private onMouseWheel(event: WheelEvent) {
    if (!this.enabled || !this.enableZoom || (this.state !== 'NONE' && this.state !== 'ROTATE')) return

    event.preventDefault()

    this.handleMouseWheel(event)
  }

  private onTouchStart(event: TouchEvent) {
    if (!this.enabled) return

    event.preventDefault()

    if (event.touches.length === 1) {
      if (!this.enableRotate) return
      this.handleTouchStartRotate(event)
      this.state = 'ROTATE'
    } else if (event.touches.length === 2) {
      if (!this.enableZoom && !this.enablePan) return
      this.handleTouchStartDollyPan(event)
      this.state = 'DOLLY'
    }
  }

  private onTouchMove(event: TouchEvent) {
    if (!this.enabled) return

    event.preventDefault()

    if (event.touches.length === 1) {
      if (!this.enableRotate) return
      this.handleTouchMoveRotate(event)
    } else if (event.touches.length === 2) {
      if (!this.enableZoom && !this.enablePan) return
      this.handleTouchMoveDollyPan(event)
    }
  }

  private onTouchEnd() {
    if (!this.enabled) return
    this.state = 'NONE'
  }

  private handleMouseDownRotate(event: MouseEvent) {
    this.rotateStart.set(event.clientX, event.clientY)
  }

  private handleMouseDownDolly(event: MouseEvent) {
    this.dollyStart.set(event.clientX, event.clientY)
  }

  private handleMouseDownPan(event: MouseEvent) {
    this.panStart.set(event.clientX, event.clientY)
  }

  private handleMouseMoveRotate(event: MouseEvent) {
    this.rotateEnd.set(event.clientX, event.clientY)
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed)

    const element = this.domElement
    this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientHeight)
    this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight)

    this.rotateStart.copy(this.rotateEnd)
    this.update()
  }

  private handleMouseMoveDolly(event: MouseEvent) {
    this.dollyEnd.set(event.clientX, event.clientY)
    this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart)

    if (this.dollyDelta.y > 0) {
      this.dollyOut(this.getZoomScale())
    } else if (this.dollyDelta.y < 0) {
      this.dollyIn(this.getZoomScale())
    }

    this.dollyStart.copy(this.dollyEnd)
    this.update()
  }

  private handleMouseMovePan(event: MouseEvent) {
    this.panEnd.set(event.clientX, event.clientY)
    this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed)
    this.pan(this.panDelta.x, this.panDelta.y)
    this.panStart.copy(this.panEnd)
    this.update()
  }

  private handleMouseWheel(event: WheelEvent) {
    if (event.deltaY < 0) {
      this.dollyIn(this.getZoomScale())
    } else if (event.deltaY > 0) {
      this.dollyOut(this.getZoomScale())
    }
    this.update()
  }

  private handleTouchStartRotate(event: TouchEvent) {
    if (event.touches.length === 1) {
      this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY)
    }
  }

  private handleTouchStartDollyPan(event: TouchEvent) {
    if (this.enableZoom) {
      const dx = event.touches[0].pageX - event.touches[1].pageX
      const dy = event.touches[0].pageY - event.touches[1].pageY
      const distance = Math.sqrt(dx * dx + dy * dy)
      this.dollyStart.set(0, distance)
    }

    if (this.enablePan) {
      const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX)
      const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY)
      this.panStart.set(x, y)
    }
  }

  private handleTouchMoveRotate(event: TouchEvent) {
    if (event.touches.length === 1) {
      this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY)
      this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed)

      const element = this.domElement
      this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientHeight)
      this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight)

      this.rotateStart.copy(this.rotateEnd)
    }
  }

  private handleTouchMoveDollyPan(event: TouchEvent) {
    if (this.enableZoom) {
      const dx = event.touches[0].pageX - event.touches[1].pageX
      const dy = event.touches[0].pageY - event.touches[1].pageY
      const distance = Math.sqrt(dx * dx + dy * dy)

      this.dollyEnd.set(0, distance)
      this.dollyDelta.set(0, Math.pow(this.dollyEnd.y / this.dollyStart.y, this.zoomSpeed))

      this.dollyOut(this.dollyDelta.y)
      this.dollyStart.copy(this.dollyEnd)
    }

    if (this.enablePan) {
      const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX)
      const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY)

      this.panEnd.set(x, y)
      this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed)
      this.pan(this.panDelta.x, this.panDelta.y)
      this.panStart.copy(this.panEnd)
    }
  }

  private rotateLeft(angle: number) {
    this.sphericalDelta.theta -= angle
  }

  private rotateUp(angle: number) {
    this.sphericalDelta.phi -= angle
  }

  private pan(deltaX: number, deltaY: number) {
    const offset = new THREE.Vector3()
    const position = this.camera.position

    offset.copy(position).sub(this.target)
    let targetDistance = offset.length()
    targetDistance *= Math.tan((this.camera.fov / 2) * Math.PI / 180.0)

    const panLeft = new THREE.Vector3()
    panLeft.setFromMatrixColumn(this.camera.matrix, 0)
    panLeft.multiplyScalar(-2 * deltaX * targetDistance / this.domElement.clientHeight)

    const panUp = new THREE.Vector3()
    panUp.setFromMatrixColumn(this.camera.matrix, 1)
    panUp.multiplyScalar(2 * deltaY * targetDistance / this.domElement.clientHeight)

    this.panOffset.copy(panLeft).add(panUp)
  }

  private dollyOut(dollyScale: number) {
    this.scale /= dollyScale
  }

  private dollyIn(dollyScale: number) {
    this.scale *= dollyScale
  }

  private getZoomScale() {
    return Math.pow(0.95, this.zoomSpeed)
  }

  public update(): boolean {
    const offset = new THREE.Vector3()
    const quat = new THREE.Quaternion().setFromUnitVectors(this.camera.up, new THREE.Vector3(0, 1, 0))
    const quatInverse = quat.clone().invert()

    const lastPosition = new THREE.Vector3()
    const lastQuaternion = new THREE.Quaternion()

    const twoPI = 2 * Math.PI

    return (() => {
      const position = this.camera.position

      offset.copy(position).sub(this.target)
      offset.applyQuaternion(quat)

      this.spherical.setFromVector3(offset)

      if (this.enableDamping) {
        this.spherical.theta += this.sphericalDelta.theta * this.dampingFactor
        this.spherical.phi += this.sphericalDelta.phi * this.dampingFactor
      } else {
        this.spherical.theta += this.sphericalDelta.theta
        this.spherical.phi += this.sphericalDelta.phi
      }

      let min = this.minAzimuthAngle
      let max = this.maxAzimuthAngle

      if (isFinite(min) && isFinite(max)) {
        if (min < -Math.PI) min += twoPI
        else if (min > Math.PI) min -= twoPI

        if (max < -Math.PI) max += twoPI
        else if (max > Math.PI) max -= twoPI

        if (min <= max) {
          this.spherical.theta = Math.max(min, Math.min(max, this.spherical.theta))
        } else {
          this.spherical.theta = (this.spherical.theta > (min + max) / 2) ?
            Math.max(min, this.spherical.theta) :
            Math.min(max, this.spherical.theta)
        }
      }

      this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi))
      this.spherical.makeSafe()
      this.spherical.radius *= this.scale

      this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius))

      if (this.enableDamping) {
        this.target.addScaledVector(this.panOffset, this.dampingFactor)
      } else {
        this.target.add(this.panOffset)
      }

      offset.setFromSpherical(this.spherical)
      offset.applyQuaternion(quatInverse)

      position.copy(this.target).add(offset)

      this.camera.lookAt(this.target)

      if (this.enableDamping) {
        this.sphericalDelta.theta *= (1 - this.dampingFactor)
        this.sphericalDelta.phi *= (1 - this.dampingFactor)
        this.panOffset.multiplyScalar(1 - this.dampingFactor)
      } else {
        this.sphericalDelta.set(0, 0, 0)
        this.panOffset.set(0, 0, 0)
      }

      this.scale = 1

      if (this.zoomChanged ||
        lastPosition.distanceToSquared(this.camera.position) > 1e-6 ||
        8 * (1 - lastQuaternion.dot(this.camera.quaternion)) > 1e-6) {

        lastPosition.copy(this.camera.position)
        lastQuaternion.copy(this.camera.quaternion)
        this.zoomChanged = false

        return true
      }

      return false
    })()
  }

  public dispose() {
    this.removeEventListeners()
  }

  public reset() {
    this.target.set(0, 0, 0)
    this.camera.position.set(400, 300, 400)
    this.camera.lookAt(this.target)
    this.update()
  }
}
