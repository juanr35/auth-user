import React from "react";

// reactstrap components
import {
  Card,
  Col,
} from "reactstrap";
import { LoopingRhombusesSpinner } from 'react-epic-spinners'

function Loader({ heightCard = 35 }) {
  return (
        <Card 
          className="justify-content-center text-center bg-secondary shadow border-0" 
          style={{ 
            height: `${heightCard}rem`,
            width: "200px",
          }}
        >            
          <div>
            <LoopingRhombusesSpinner
              color="#172b4d" 
              size="30"
              className="align-middle" 
              style={{
                display: "inline-block",
              }}
            />
          </div>
        </Card>
  );
}

export default Loader;
