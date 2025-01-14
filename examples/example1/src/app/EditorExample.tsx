import {
  QLogicBuilder,
  QLogicBuilderProvider,
  QLogicCodePreview,
  QLogicEnvironment,
} from '@qlogic/react';
import '@qlogic/react/index.esm.css';
import { useMemo } from 'react';
import { Box, Button, ButtonGroup, Card, Divider, Grid, Typography } from '@mui/material';

export function EditorExample() {
  const env = useMemo(() => QLogicEnvironment.create({
    allowedRootBlocks: [{ qfunc: 'CreateCharge' }],
    qfuns: [
      {
        name: 'CreateCharge',
        returns: [
          { name: 'Charge', type: 'number', label: 'Charge' },
          { name: 'Label', type: 'number', label: 'Label' },
          {
            name: 'Type',
            type: 'options',
            label: 'Type',
            options: [
              { label: 'Premium', value: 'premium' },
              { label: 'Tax', value: 'tax' },
              { label: 'Fee', value: 'fee' },
              { label: 'Other', value: 'other' },
            ]
          },
        ]
      }
    ],
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
          },
          {
            name: 'Type',
            type: 'options',
            label: 'Type',
            options: [
              { label: 'Premium', value: 'premium' },
              { label: 'Tax', value: 'tax' },
              { label: 'Fee', value: 'fee' },
              { label: 'Other', value: 'other' },
            ]
          },
        ],
        returnType: 'number',
        func: (option, a: number, b: number) => a + b,
      },
      {
        name: 'alert',
        args: [
          {
            name: 'msg',
            type: 'any',
          }
        ],
        func: (opt, msg: string) => alert(msg),
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
              <ButtonGroup size={'small'} variant={'contained'} disableElevation>
                <Button onClick={() => console.log(helper.state)}>
                  Log
                </Button>
                <Button onClick={() => env.execute(helper.state, ctx)}>
                  Run
                </Button>
              </ButtonGroup>
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
