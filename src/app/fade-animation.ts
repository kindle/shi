import { Animation, createAnimation } from '@ionic/angular';

export const enterAnimation = (baseEl: HTMLElement, opts?: any): Animation|any => {
    const DURATION = 1000;

    if (opts.direction === 'forward') {
        // Fade in the next page
        return createAnimation()
        .addElement(opts.enteringEl)
        .duration(DURATION)
        .easing('ease-in')
        .fromTo('opacity', 0, 1);
    } else if (opts.direction === 'back') {
        // Fade in the previous page
        const rootAnimation = createAnimation()
        .addElement(opts.enteringEl)
        .duration(DURATION)
        .easing('ease-out')
        .fromTo('opacity', 0, 1);

        // Fade out the current top page
        const leavingAnim = createAnimation()
        .addElement(opts.leavingEl)
        .duration(DURATION)
        .easing('ease-out')
        .fromTo('opacity', 1, 0);

        // Chain both animations
        return createAnimation().addAnimation([rootAnimation, leavingAnim]);
    }
};