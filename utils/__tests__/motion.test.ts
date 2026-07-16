import { 
  spring, 
  headlineFadeIn, 
  floatIn, 
  zoomIn, 
  slideIn 
} from "../motion";

describe("motion variants", () => {
  it("exports valid spring configuration", () => {
    expect(spring).toHaveProperty("type", "spring");
    expect(spring).toHaveProperty("stiffness");
    expect(spring).toHaveProperty("damping");
  });

  it("exports valid headlineFadeIn object", () => {
    expect(headlineFadeIn.hidden).toHaveProperty("opacity", 0);
    expect(headlineFadeIn.show).toHaveProperty("opacity", 1);
  });

  it("generates correct floatIn configuration based on direction", () => {
    const upConfig = floatIn("up");
    expect(upConfig.hidden.y).toBeGreaterThan(0); // starts below, moves up
    
    const downConfig = floatIn("down");
    expect(downConfig.hidden.y).toBeLessThan(0); // starts above, moves down
  });

  it("generates correct zoomIn configuration", () => {
    const config = zoomIn(0.5, 0.3);
    expect(config.hidden.scale).toBe(0.5);
    expect(config.show.transition.duration).toBe(0.3);
  });

  it("generates correct slideIn configuration", () => {
    const slideLeft = slideIn("left", "tween", 0.5);
    expect(slideLeft.hidden.x).toBe("-100%");
    
    const slideRight = slideIn("right", "spring", 0.3);
    expect(slideRight.hidden.x).toBe("100%");
    
    const slideUp = slideIn("up", "tween", 0.5);
    expect(slideUp.hidden.y).toBe("100%");
    
    const slideDown = slideIn("down", "spring", 0.3);
    expect(slideDown.hidden.y).toBe("-100%");
  });
});
