import {
  QLogicBuilder,
  QLogicBuilderProvider,
  QLogicCodePreview,
  QLogicEnvironment,
} from '@qlogic/react';
import '@qlogic/react/index.esm.css';
import { useMemo } from 'react';
import { Box, Button, Card, Divider, Grid, Typography } from '@mui/material';

export function EditorExample() {
  const env = useMemo(() => QLogicEnvironment.create({
    functions: [
      {
        name: 'add',
        args: [
          {
            name: 'a',
            type: 'number',
          },
          {
            name: 'b',
            type: 'number',
          }
        ],
        returnType: 'number',
        func: (a: number, b: number) => a + b,
      },
      {
        name: 'alert',
        args: [
          {
            name: 'msg',
            type: 'any',
          }
        ],
        func: (msg: string) => alert(msg),
      },
    ],
  }), []);

  const ctx = useMemo(() => {
    return {
      data: {
        a: 1,
        b: 2,
      }
    };
  }, []);

  return (
    <QLogicBuilderProvider environment={env}>
      {(helper) => (
        <Card variant={'outlined'} sx={{ p: 2, m: 2 }}>
          <Grid container direction={'row'} spacing={2}>
            <Grid item md={12} container direction={'row'}>
              <Typography variant={'h5'}>QLogic Builder</Typography>
              <Box flex={1} />
              <Button variant={'contained'} onClick={() => env.execute(helper.state, ctx)} disableElevation>
                Run
              </Button>
            </Grid>
            <Grid item md={12}>
              <Divider/>
            </Grid>
            <Grid item md={8} sm={12} xs={12}>
              <QLogicBuilder />
            </Grid>
            <Grid item md={3}>
              <QLogicCodePreview />
            </Grid>
          </Grid>
        </Card>
      )}
    </QLogicBuilderProvider>
  );
}
